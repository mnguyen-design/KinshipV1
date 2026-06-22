# Kinship — Product Requirements Document (v1)

*Figma Config Makeathon build. Solo. ~11 days.*

---

## 1. One-liner

Kinship helps people from large extended families build their family tree and always know the correct, culturally specific term for every relative, so that walking into a wedding or a family gathering feels like recognition instead of panic. v1 is built for **Teochew** families.

---

## 2. The problem

In Teochew families, you don't call relatives by generic words like "aunt" or "uncle." The correct term depends on which side of the family they're on, whether they're older or younger than your parent, their gender, whether they're related by blood or marriage, and even their birth rank among their siblings. Your mother's brother (Gu 舅) and your father's brother (Be 伯 or Zeg 叔) are not the same word. Your father's older brother and your father's younger brother are not the same word.

The Teochew community itself names this exact fear. As one community guide puts it, the dread is being "ambushed" by a group of uncles and aunts you haven't seen in a while and standing there tongue-tied, unable to address them. For the diaspora generation who didn't grow up immersed in the language, this is genuinely hard to keep straight, and the moment of failure is public: you're at a wedding or Lunar New Year, an elder is right in front of you, and you freeze. The knowledge also lives mostly in the heads of the oldest generation, and it isn't being written down. Teochew in particular has thin published reference material and no widely adopted romanization standard, which makes preserving it both harder and more worth doing.

## 3. Who it's for

The primary user is **the diaspora-generation adult with a large extended family** who wants to participate fully in their culture but can't reliably remember the naming system. They are motivated, a little anxious about getting it wrong, and proud of their heritage.

**The trigger moment:** they're about to attend, or are at, a large family event (a wedding, a funeral, Lunar New Year, a milestone birthday) where they'll meet many relatives at once.

## 4. What the user should feel

After using Kinship, the user should feel **confident** (I know what to call everyone), **connected** (I can see how my whole family fits together), **reassured** (I won't embarrass myself), and **curious** (I want to keep filling in the tree and learn more).

---

## 5. The primary job and the roadmap

This product can do three jobs. v1 nails one; the others are built on top of the same foundation later.

- **v1 — Preserve (Teochew).** The user builds their actual family into the app. Because the tree is personal and persistent, every other capability has something to stand on.
- **Next — Lookup.** Fast "what do I call this person" answers, drawing on the tree the user already built.
- **Next — Learn.** Understanding *why* the system works the way it does (the worldview behind the distinctions).

Preserve is the spine because it's the one that creates a returnable keepsake and makes the naming personal to each family's actual shape.

---

## 6. The core architecture (the most important section)

The naming logic is the heart of the product, and how it's built is the single most important design decision.

**Kinship terms are deterministic and rule-based. AI must never be the source of truth for the term itself.** A hallucinated kinship term is the cardinal sin of this app: it teaches someone to insult or confuse a relative. So the architecture splits the work:

1. **AI handles intent.** It parses messy natural language ("my dad's younger brother's wife") into structured attributes: side (paternal/maternal), generation, relative age vs. the linking parent, gender, and blood-vs-marriage.
2. **A deterministic rule engine produces the term.** Given the structured path, a curated, human-verified Teochew term table returns the exact characters, romanization (Peng'im), and breakdown. This table is built from authoritative community sources (see §14). This is guaranteed correct within the v1 boundary (see §8).
3. **Beyond the guaranteed boundary, the app is honest.** It offers a best-effort guess clearly labeled as unconfirmed, and invites the user to enter the correct term, which it then saves to *their* family. The family teaches the app; the app never bluffs.

This "AI for the fuzzy part, rules for the truth, honesty at the edges" pattern is the defensible, senior decision at the center of the build, and it's the strongest 20-second beat in the demo video.

**Language is a parameter of the engine, not a skin on top of it.** Different languages don't just use different words for the same relationships, they carve the relationships differently (see §11.1). So each supported language ships as a pair: a verified **term table** *and* a **resolution rule set**. Switching display language swaps both. v1 ships Teochew as the fully verified pair; Mandarin is scaffolded as a second pair (see §8).

---

## 7. How relationships are represented (data model)

The tree is stored as **people connected by primitive edges**, not as pre-labeled relationships. Every kinship term is computed as a **path** between two people. By default the path starts at "you" (ego), but the engine accepts *any* person as the starting point, which is what powers the connect-any-two feature (§10, F8) and re-rooting. "What do I call X" is simply the case where the start person is you.

**Primitive edges:**
- `parent` / `child` (each person has a gender, so a parent resolves to father or mother)
- `spouse`
- `sibling` (carries relative birth order)

**A relationship term is a path signature.** Examples (start person → target):
- "mother's younger brother" = start → parent(mother) → sibling(younger, male)
- "father's older brother's wife" = start → parent(father) → sibling(older, male) → spouse

**Resolving an arbitrary pair (A and B)** takes two steps: first find the connecting path through the graph (a shortest-path / lowest-common-ancestor walk across parent, sibling, and spouse edges), then run that path through the rule engine once with A as the start (A's term for B) and once reversed with B as the start (B's term for A). The two terms are usually **asymmetric**, and by Teochew rule 8 one direction may resolve to "address by name" rather than a term when that person is clearly junior.

The rule engine reads the path signature and composes the term. This path approach is what lets the tree go to **any depth the user wants** while the *correctness guarantee* stays scoped to the path signatures we've verified.

**Core entities:**
- **Person:** id, given name, optional nickname/label the user prefers, gender, optional birth order, optional photo, optional notes, plus **optional `location` and `origin` / migration fields** (current place, place of origin, and when/where they moved). These stay out of the v1 UI but are stored now so the future "roots" map (§20 north star) has data to draw on without a re-architecture.
- **Edge:** type (parent/child/spouse/sibling), the two person ids, birth-order metadata where relevant.
- **Family:** the collection of people and edges, anchored to the ego ("you").
- **TermOverride:** a user-supplied correct term saved against a specific path signature for this family.
- **Language:** a first-class setting. Each language carries its own verified term table and rule set; the guaranteed boundary and the `siblingSetComplete` logic apply *per language*. The family stores a default display language and the user can switch on demand. A path can be confidently resolved in one language and marked "confirm this one" in another, depending on which tables are verified.

**Birth order is load-bearing in Teochew.** Teochew adds a rank prefix to many terms (Tua 大 for the oldest, Soi 細 for the youngest, and a number for those in between, e.g. Zi-be 二伯 "second-eldest paternal uncle," Si-zeg 四叔 "fourth-eldest paternal uncle"). To assign a rank correctly the engine needs the *complete* set of same-category siblings and their order. So each sibling group carries a **`siblingSetComplete` flag**: when the user confirms they've added everyone in that group, the engine applies the rank prefix; until then, it gives the base term (e.g. just Be 伯) and offers to add the rank once the set is complete. This keeps numbering honest rather than guessing a rank from an incomplete tree.

---

## 8. Scope

### In scope for v1
- Stateful, persistent family tree that the user builds, to **any depth**.
- **Teochew** terms with **Peng'im** romanization, plus a plain-English "say it like this" approximation.
- **Guaranteed-correct naming within the v1 boundary** (below).
- Natural-language input with a **guided tap-to-build fallback**.
- Onboarding that **scaffolds the skeleton** through a few quick questions.
- **Result card** with the term, breakdown, and supporting detail.
- **Language display toggle** *(nice-to-have)* — switch the displayed language; Teochew is the verified default, Mandarin scaffolded as the second pair if time allows.
- **Unknown/confirm flow:** best-effort guess plus user correction saved to the family.
- **The bloom:** a satisfying full-tree visualization and a **count of names you can now say**.

### The v1 guaranteed-correct boundary
The rule engine returns verified Teochew terms for these relationships (this covers essentially everyone at a wedding or gathering). Teochew's structure actually makes a *wider* guarantee tractable than Mandarin would, because several categories collapse:
- **Grandparents**, both sides — A-gong 亞公 / A-ma 亞嫲 (maternal optionally prefixed Gua- 外, but not required).
- **Great-grandparents and grandparents' siblings** via the Lau 老 "grand" prefix (Lau-gong, Lau-be, Lau-gou, etc.).
- **Parents** — Ba 爸 / Ma 媽.
- **Parents' siblings and their spouses**, with the three-uncle / two-aunt distinctions: father's elder brother Be 伯 (wife M 姆), father's younger brother Zeg 叔 (wife Sim 嬸), mother's brother Gu 舅 (wife Gim 妗); father's sister Gou 姑, mother's sister Yi 姨, their husbands Die[n] 丈.
- **The user's own siblings**, by relative age and gender — Hia[n] 兄, Di 弟, Ze 姊, Mue 妹.
- **Cousins** — in Teochew you address cousins *exactly as siblings* (Hia[n]/Di/Ze/Mue by relative age and gender). The 堂 Tang / 表 Bieu distinction is only for *describing* a cousin, not addressing them, which removes a whole layer of complexity from the address path.
- **Nephews and nieces** — collapse to the single broad term Sung 孫.
- **The user's own in-laws** — spouse's parents and siblings.
- **The rank prefix** (Tua 大 / number / Soi 細) applied to any of the above categories whose sibling set is marked complete.

Anyone the user adds **beyond** this boundary still appears in the tree and still gets a best-effort guess, but is clearly marked "confirm this one," and the user can set and save the correct term.

### Stretch (only if time allows, in priority order)
1. Simple **export/share** of the tree (as an image or a read-only view).
2. **Lightweight basic sharing** between family members. *Note: true real-time multiplayer sync requires a backend that Figma Make does not provide. Treat anything beyond export as a v2 commitment, not a v1 promise.*

### Non-goals for v1 (explicitly out, defends the scope)
- **Mandarin** — scaffolded as a second language pair (term table plus rule set) and exposed via the language toggle. Fully verifying it is a **nice-to-have** for v1; if the deadline is tight it gracefully becomes the first v2 addition. Teochew remains the guaranteed core regardless.
- **Cantonese and other dialects/languages** — the same engine retargets later (each is a new verified pair).
- **Vietnamese.**
- **OCR** of handwritten or printed family records.
- **Geography / migration "roots" map** — placing the family on real geography and tracing migration over time. This is the **north star** (§20) and the reason for the optional location fields in §7, but it is firmly v2+; v1 only stores the data, it does not visualize it.
- **Audio / video** recording or playback of pronunciation.
- **Real-time multiplayer / cross-family sync** (backend limitation).

---

## 9. Key scenarios

**Scenario A — The wedding (primary).** Mei is invited to her cousin's wedding next week and will meet relatives she rarely sees. The night before, she opens Kinship, reviews her tree, and taps through the relatives who'll be there. At the wedding she greets each one correctly. She feels confident and present instead of anxious.

**Scenario B — Documenting with an elder (purpose).** Over dinner, Mei sits with her grandmother and adds relatives one at a time, asking her grandmother to confirm the terms the app isn't sure about. The corrections save to her family. She's preserving knowledge that otherwise lived only in her grandmother's memory.

**Scenario C — Connecting two relatives (the standout).** At the wedding, Mei watches her young nephew meet her uncle and wonders what they should call each other. She taps both names in Kinship. It shows the chain ("he's your nephew's grand-uncle"), what the nephew should say, and what the uncle says back. She also taps herself and her own daughter's name against the elders to see what her daughter will grow up calling everyone.

---

## 10. Feature requirements

### F1 — Onboarding scaffold
First open is an empty app, and big families are a lot of data entry, so onboarding must make the skeleton appear fast.
- Start from "you," then ask a short series of scaffolding questions: How many siblings do you have, and are they older or younger? How many siblings does your mother have? Your father? Are you married? Do you have children?
- Each answer instantly generates the corresponding people and edges, so the user watches the tree take shape as they answer.
- Goal: a usable skeleton in under ~2 minutes, with names addable afterward.

### F2 — The family tree (stateful)
- A clear, warm visualization of the user's family, expandable to any depth.
- Add, edit, and remove people; set gender, birth order, names, nicknames, photos.
- Persists across sessions for the same user.

### F3 — Relationship resolver
- **Primary input:** natural language ("what do I call my dad's older sister"). AI parses it into the structured path.
- **Guided fallback:** when typing is ambiguous or the user prefers, a tap-to-build path ("start with you → parent → sibling…") produces the same structured path.
- The resolver runs the path through the rule engine and returns the result card.

### F4 — Result card
In priority order:
- **Chinese characters** *(essential)* — including dialect characters such as 嫲 (A-ma) and 妗 (Gim).
- **Literal breakdown** of the relationship, e.g. "father's-older-brother" *(essential)*
- **Peng'im romanization** with the rank prefix where applicable, e.g. Zi-be 二伯 *(nice-to-have)*
- **Plain-English "say it like this" approximation** *(nice-to-have)*
- **Nickname / personal label** the user wants to attach to this specific relative *(nice-to-have)*

### F5 — Unknown / confirm flow (trust-defining)
- When the path falls outside the guaranteed boundary or confidence is low, the card shows a best-effort guess clearly marked as **unconfirmed**.
- The user can **enter the correct term** and **adjust the relationship** if the structure is wrong.
- Corrections save to the family as a `TermOverride` and are reused next time.
- The app never asserts a term it can't stand behind.

### F6 — The bloom and the name count (the emotional moment)
- A designed moment where the completed tree **blooms** into its full visual form.
- A running **count of names the user can now say** ("you can now name 23 relatives"), turning a database into a small sense of accomplishment and belonging.

### F7 — Language display toggle *(nice-to-have)*
- A control to switch the displayed language (Teochew verified default; Mandarin scaffolded).
- Switching re-renders every term through the selected language's table and rule set, so the *same* tree shows Teochew or Mandarin terms on demand.
- The name count and guaranteed/confirm states recompute per language, since a relationship verified in Teochew may still need confirmation in Mandarin.
- Honest empty state: if the selected language's table doesn't cover a relationship, show the "confirm this one" flow rather than a wrong word.

### F8 — Connect any two people (the standout feature)
Select any two people in the tree and Kinship shows how they're related and what each calls the other. This is the most differentiated thing in the product, and it generalizes both the everyday resolver (F3) and re-rooting.
- **Input:** pick person A and person B from the tree.
- **Output, in three parts:**
  1. **The relationship chain**, in plain language, e.g. "Barry is Amy's father's younger brother."
  2. **A's term for B** — characters, romanization, pronunciation, with the rank prefix if the sibling set is complete.
  3. **B's term for A** — the reverse, shown side by side so the asymmetry is visible.
- **Honest behaviors the engine must honor:**
  - **Asymmetry is expected** (older brother / younger sister, uncle / niece).
  - **Junior-by-name (rule 8):** if one person is clearly junior, that direction shows "addressed by name," not an invented term.
  - **In-law delegation (rule 7):** when the connecting path runs through a marriage, the speaker addresses the relative as their spouse would, except the spouse's immediate siblings; the engine borrows the spouse's perspective for that leg.
  - **No path:** if A and B aren't connected in the tree, say so plainly rather than forcing a relationship.
  - **Multiple paths:** if more than one connection exists (intermarriage, step-relations), show the closest and note the alternative rather than silently picking one.
  - **Outside the verified boundary:** fall back to the "confirm this one" flow per language.
- **Why it matters:** traditional family trees can tell you two people are "second cousins"; none tell you what they actually call each other at the table. This is the clearest "only Kinship does this" beat for the video, and selecting your own child as person A is exactly the re-rooting "what will my kids call everyone" view.

---

## 11. Naming logic — the Teochew rules the engine encodes

The engine resolves a term by walking the path from ego to the target and applying the rules below. These are adapted from the two community sources in §14. *(Terms are representative; the canonical, fully verified table is the curated data asset in §14.)*

**The resolution axes:**
- **Side:** paternal vs maternal.
- **Relative age:** older vs younger than the linking parent (governs Be 伯 vs Zeg 叔 for paternal uncles).
- **Gender** of the relative.
- **Blood vs marriage:** the source diagram color-codes these (blood relatives 親人 Cing-nang; relatives by marriage 親情 Cing-zia[n]). The engine carries the same flag.
- **Birth rank** within a sibling set (governs the Tua / number / Soi prefix).

**The rules, encoded:**

1. **Grandparents (both sides):** A-gong 亞公, A-ma 亞嫲. Maternal may optionally take the Gua- 外 prefix but it is not required and the app defaults to omitting it.
2. **Three uncles, two aunts.** Father's elder brother → Be 伯 (his wife M 姆). Father's younger brother → Zeg 叔 (his wife Sim 嬸). Mother's brother → Gu 舅 (his wife Gim 妗). Father's sister → Gou 姑; mother's sister → Yi 姨; the husband of either → Die[n] 丈. Note the asymmetry: paternal uncles split by age, but maternal uncles and all aunts do not split by age in the base term.
3. **The A- 亞 filler.** Spoken address often prefixes A- (A-gou, A-yi); it carries no meaning and is a display nicety.
4. **Lau 老 = "grand," one generation up.** Grandparents' siblings → Lau-be, Lau-zeg, Lau-gou. Great-grandparents → Lau-gong 老公, Lau-ma 老嫲.
5. **Cousins are addressed as siblings.** Regardless of actual line, a cousin is addressed by the sibling terms: elder brother Hia[n] 兄, younger brother Di 弟, elder sister Ze 姊, younger sister Mue 妹. The 堂 Tang (father's-brothers' children, same surname) vs 表 Bieu (all other cousins) distinction is for *description only* and appears as a sub-label, never as the address term.
6. **Nephews and nieces collapse to Sung 孫.**
7. **In-laws:** address your spouse's relatives as your spouse would, with one exception — your spouse's *immediate siblings* are addressed as you would teach a child to address them (e.g. wife's sister → A-yi, not Ze/Mue). Husband's-family and wife's-family in-law terms are tabled separately (e.g. father-in-law: husband's father Da-kua 大官, wife's father Die[n]-nang 丈人 / Ngak-be 岳父).
8. **Juniors go by first name.** Anyone junior by age *and* generation can be addressed by name, so the app does not force a term on clearly-junior relatives (it still records the descriptive relationship). The exception the engine must respect: a person younger in years who is senior in generation (a young uncle/aunt) is *not* name-only.
9. **Ranking (Tua / number / Soi).** When two or more relatives share a base term, prefix the oldest with Tua 大, the youngest with Soi 細, and the others with their number (Zi-be 二伯, Si-zeg 四叔, Soi-zeg 細叔). Applied only when `siblingSetComplete` is true (see §7).
10. **Name + term for seniors.** A senior relative may be addressed by personal name coupled with the term (e.g. an aunt named Gek-leng → Gek-leng-gou). The app can offer this form once a name is attached.

Each resolved leaf maps to one verified entry: characters, Peng'im, rank prefix (if applicable), the literal breakdown, and any Tang/Bieu descriptive sub-label.

### 11.1 Languages differ in rules, not just words

Mandarin is the planned second pair, and it does **not** resolve the same way as Teochew. The toggle has to swap rules, not just vocabulary:

- **Cousins:** Teochew addresses cousins as plain siblings. Mandarin keeps the line distinction *in the address term itself*: father's-brother's children (same surname) are 堂 (堂哥 táng-gē, 堂妹 táng-mèi); all other cousins are 表 (表哥 biǎo-gē, 表妹 biǎo-mèi).
- **Maternal uncles:** Teochew uses one term Gu 舅 regardless of age; Mandarin similarly uses 舅舅 (jiùjiu), but paternal uncles split into 伯伯 (bóbo, older) vs 叔叔 (shūshu, younger).
- **Aunts:** Mandarin splits father's older vs younger sister (姑妈 gūmā vs 姑姑 gūgu) and mother's (姨妈 yímā vs 阿姨 āyí), where Teochew uses Gou and Yi as base terms with ranking applied separately.
- **Nephews/nieces:** Teochew collapses to Sung 孫; Mandarin splits by side (brother's son 侄子 zhízi vs sister's son 外甥 wàisheng).

**Caution on generic Mandarin sources.** Popular template sources frequently tangle two independent axes: 堂 vs 表 is governed by **lineage** (paternal-brother's children share your surname → 堂; everyone else → 表), while 兄/弟/姐/妹 is governed by **age and gender**. A source that presents "older → 堂, younger → 表" is wrong and incomplete. The Mandarin rule set must treat lineage and age/gender as orthogonal, and the table must be verified the same way the Teochew one is — never lifted whole from a generic chart.

---

## 12. Screen / frame architecture (for Figma Make)

1. **Welcome / intro** — the problem in one line, single call to action to begin.
2. **Onboarding flow** — the scaffolding questions (F1), tree forming live.
3. **Tree view (home)** — the persistent family tree (F2), entry point to everything.
4. **Person detail** — a relative's card: their info plus the resolved term (F4).
5. **Resolver / "what do I call…"** — natural-language input with guided fallback (F3).
6. **Confirm / correct** — the unknown-term flow (F5).
7. **Connect any two** — pick person A and person B; show the relationship chain and both directions side by side (F8).
8. **The bloom** — full-tree moment and name count (F6).

---

## 13. AI usage and guardrails (responsible-AI framing)

- **AI is used for:** parsing natural-language relationship descriptions into structured paths; optionally generating the plain-English "how to say it" approximation and short cultural-context notes (a *Learn* feature, clearly informational).
- **AI is NOT used for:** producing the authoritative kinship term within the guaranteed boundary. That comes from the verified rule table only.
- **Fallback behavior:** if AI parsing is uncertain, the app routes the user to the guided tap-to-build path rather than guessing. If a path is outside the guaranteed set, the app labels its output unconfirmed and asks for confirmation.
- This restraint is a feature, not a limitation, and should be visible in the product and called out in the video.

---

## 14. Build notes and constraints

- **Persistence:** the tree must survive across sessions. Use the persistence available in the build environment; keep the data model compact (people + edges + overrides).
- **No real multiplayer:** Figma Make has no backend for cross-user sync. Sharing in v1 is limited to export or a read-only view.
- **Canonical term table ownership:** the Teochew term set is curated and verified by a trusted human source (you, with your family) before launch, built from the sources below. Accuracy is the product's entire value, so this table is the source of truth and is not AI-generated.
- **Romanization decision (needs your sign-off):** the two sources use different romanizations — The Teochew Store uses a readable, tone-light style (A-gong, Be, Zeg); Learn Teochew uses Peng'im with tone numbers (sing1-se). Recommendation for v1: adopt the **readable style as the primary display** plus the plain-English approximation, since the user mostly wants to be understood and respectful, and surface precise Peng'im-with-tones as an optional detail. Tones do carry meaning in Teochew, so flag this as a deliberate simplification rather than an oversight.
- **Sources and attribution:** terms are drawn from *"How to Address Your Relatives in Teochew"* (The Teochew Store) and the Terms of Address reference at learnteochew.com. The kinship terms themselves are facts and free to use; The Teochew Store diagram is licensed CC BY-NC-SA, so do **not** reproduce their diagram image in the product — use it only as a reference for building your own term table, and credit both sources in the app and the submission video.
- **Keep scope honest:** a focused build that nails the guaranteed boundary and the bloom beats an over-scoped one that half-works. Resist adding relatives' relatives' edge cases into v1.

---

## 15. Success criteria

**Product:** a first-time user can build a usable family skeleton in a couple of minutes, get a guaranteed-correct term for any relative within the boundary, correct anything outside it, and reach the bloom moment feeling confident and connected.

**Makeathon alignment:**
- *Quality of idea / Building with Purpose:* solves a real, culturally specific problem for the diaspora generation and helps preserve knowledge held by elders.
- *Quality of work and craft:* the tree, the result cards, and the bloom carry the emotional weight.
- *Innovative workflow:* the AI-parses-then-rules-resolve architecture, demonstrated end to end.
- *Build-in-public:* document the parse/rules/honesty decision and the term-table curation.

---

## 16. Risks and mitigations

| Risk | Mitigation |
|---|---|
| AI hallucinates a kinship term | AI never produces the term; deterministic rules do. AI only parses intent. |
| Teochew has thin machine data / no romanization standard | Term table is hand-curated from verified community sources, not model-generated; romanization standard chosen explicitly (see §14). |
| Rank prefix (Tua/Soi) is wrong on an incomplete tree | Apply numbering only when the sibling set is marked complete; otherwise give the base term. |
| Language toggle treated as a vocab swap, producing subtly wrong terms | Ship each language as a verified term-table-plus-rule-set pair; switching swaps both; verify Mandarin separately rather than lifting a generic chart. |
| Connect-any-two finds multiple or no path between two people | Show the closest path and note alternatives; for no connection, say so plainly instead of forcing a term. |
| Onboarding feels like heavy data entry | Scaffolding questions generate people in bulk; names added later; tree forms live. |
| Demo breaks on an edge-case relationship | Demo stays within the guaranteed boundary; show the honest "confirm this" flow deliberately as a feature. |
| Persistence is unreliable in the build tool | Keep the data model small; test save/restore early; export as a backstop. |
| Scope creep from "full extended sprawl" | Tree is unlimited but the *correctness guarantee* is boundaried; beyond it, user-confirmed terms carry the weight. |

---

## 17. Open decisions

- **Form factor:** desktop demo vs mobile-first (see §18 — needs your call, it shapes layout).
- **Romanization primary display** (see §14 — recommendation made, needs sign-off).
- Whether cultural-context notes ship in v1 as a light *Learn* touch or wait for the *Learn* release.
- Final shape of the export/share artifact if the stretch goal is reached.

---

## 18. Form factor (decision needed)

The real trigger moment, pulling out a phone at a wedding, is **mobile**. But Figma Make demos are often framed at desktop (1440×900), which reads cleanly on a submission video and matches the multi-frame layout you've used before.

The two aren't mutually exclusive, but one has to be the design target so the layouts are intentional rather than stretched. Recommendation: **design mobile-first** because it matches the actual use context and makes the "I'm standing in front of an elder right now" story honest on camera, then present it in a phone frame in the video. If you'd rather show a roomier desktop canvas, we design for that instead and the tree gets more breathing room. **This decision gates the layout specifics in §19–§20, so it's the one thing to lock before building screens.**

---

## 19. Visual and craft direction (proposed — your taste governs)

Craft is a core judging axis, so this is deliberate, not decoration. The brief: it should feel **warm, calm, and culturally rooted** — closer to a well-made paper keepsake than a utility app, and explicitly *not* the vermilion-seal portfolio identity (that's your personal brand, not this product's). Think the unhurried warmth of tea on an autumn afternoon: a thing you sit with, not a tool you rush through.

- **Tone:** reassuring and unhurried. No gamified pressure, no streaks, no badges. The one moment of delight is the bloom (F6); everywhere else is quiet confidence.
- **Palette:** warm neutrals as the base (paper, bone, soft ink) with a single restrained warm accent used sparingly for emphasis and the bloom. Reserve red for moments of warmth and celebration, never for errors — error and "confirm" states use a soft, non-alarming treatment, because an unknown relative is an invitation, not a failure.
- **Typography:** a humanist, legible sans for the interface; the **Chinese characters are the hero of every result card**, set large and given room, with romanization and the English approximation as quiet supporting layers. Choose a character typeface that is clear and respectful rather than playful.
- **The result card as the signature object:** characters large and centered, the literal breakdown beneath, romanization and pronunciation as secondary lines, rank prefix shown inline when confirmed. This card is what people screenshot and what anchors the video.
- **Honesty states designed with care:** the "confirm this one" and "addressed by name" states get real design attention, soft, inviting, clearly different from an error. Getting these to feel gentle is part of the craft story.
- **Cultural texture, lightly:** subtle paper grain or a restrained motif is welcome; avoid clichéd "oriental" ornamentation. Let typography and warmth carry the heritage feeling.
- **Lineage line colors (the transit language):** lines that connect relatives are color-coded by lineage — a warm hue for the paternal line, a cool one for the maternal, and a distinct dashed treatment for marriage — echoing the blood-vs-marriage color coding in the Teochew source diagram. The selected route in connect-any-two uses the single warm accent. Pair each color with a second cue (dash pattern, weight) so it never relies on color alone.

*All of the above is a strawman for you to push on. You're the designer; flag anything that doesn't sit right and we adjust before it hardens into screens.*

---

## 20. Information architecture, navigation, and the tree-rendering problem

**The hard problem:** a full extended Teochew family is a dense, multi-branch, multi-generation graph. Rendering the whole thing at once becomes unreadable spaghetti fast, especially on a phone. Trying to draw a complete classic genealogy tree is the most likely way the build looks broken.

**The visual language — a radial focus+context tree drawn as a transit map.** Three references combine into one coherent system:
- **Hyperbolic / mindmap layout (the structure):** the focused person sits large and central; their immediate relatives radiate outward; more distant relatives shrink and fade into the periphery. This is the focus+context answer to the spaghetti problem — you never render the whole sprawl at full size.
- **Transit-map styling (the rendering):** clean schematic lines, relatives as "stations," and **color-coded lines for lineage** (paternal, maternal, marriage). This is legible, high-craft, and gives connect-any-two (F8) its signature visual: the path between two people lights up like a route on a journey planner.

**How it behaves:**
- The home view centers on **one person** (you, by default) and shows their immediate connections as tappable stations. Tapping a station re-centers on that person — which **is** re-rooting, and the same mechanism behind F8.
- **Lineage is encoded in line color** (see §19), so blood vs marriage and paternal vs maternal read at a glance, the way the Teochew source diagram itself color-codes them.
- A secondary **list view grouped by generation and side** gives a scannable overview without a diagram, mapping cleanly onto how the Teochew system is organized.
- The **bloom (F6)** is the one place the *whole* tree appears, shown as a celebratory, full transit-map showpiece rather than a navigational surface — so it can be beautiful without staying readable at every scale.

**Build-risk note:** a true hyperbolic projection (Poincaré-disk math, continuous re-centering animation) is hard to ship well in 11 days. Build the *simplified* version — a radial layout with the focused node centered, generations rippling outward, and periphery nodes scaled down and faded. It captures the feeling at a fraction of the risk; the real hyperbolic geometry is a v2 polish item.

**Primary navigation (4 places):**
1. **My family** — the radial transit tree (home).
2. **Ask** — the resolver (F3) and connect-any-two (F8).
3. **Add / edit** — grow the tree (reachable inline from any station too).
4. **The bloom** — the full-map overview moment, earned as the tree fills in.

**Core loops:**
- *Build loop:* onboard → skeleton appears → tap a station → name it / add its relatives → repeat.
- *Use loop:* open → ask "what do I call X" or connect two people → get the card → feel confident.

Exact spacing, node sizing, and whether the tree scrolls or zooms depend on the §18 form-factor call.

**The roots horizon (north star, v2+).** The transit map is deliberately one zoom level away from a real map. The future "where in the world" view places the same stations and lines onto actual geography, with lines tracing **migration over time** — when the family moved, and from where. This turns Kinship from "who is who" into "where we come from," which is the deeper purpose. v1 doesn't build it, but the visual language and the data model (§7) are chosen to make it a natural next zoom rather than a rebuild.

---

*v1 scope reflects an ~11-day solo build for the Figma Config Makeathon. Built Teochew-first; Mandarin and other dialects are the planned v2+ expansion on the same engine.*
