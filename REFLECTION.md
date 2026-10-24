# Reflection

**Name / Andrew ID:**
Truanne / truannec

**Recitation group members (Task 2):**
Palomi, Demetrius

---

### 1. Valid but weak

Pick a property you wrote that passes on the correct implementation but
kills few or no mutants. Why is it still a *valid* property? Describe a
concrete bug (not one of our mutants) that it *would* catch.

My property "mergint wice gives the same result as merging once" killed only one public mutant in the run. 
It is valid because an already merged result should require no further changes. It would catch a bug that accidentally increased each interval's end by one on every call. So [1, 3] would become [1, 4], then [1, 5], 
violating idempotence.

### 2. A generator problem, not a property problem

Describe a mutant, from either task, that survived or was flaky because of
your **generator** rather than your property. What did the generator fail to
produce? How did you fix it? Paste the runner output from before and after.

I think touchingNotMerged was flaky because my generator chose interval starts indendently from a large
integer range. It rarely produced intervals with a shared endpoint. My existing output property required consecutive intervals to neither overlap nor touch, but rarely received inputs exposing that bug.

I aded a targeted generator that constructs [start, shared] and [shared, end], with positive lengths,
and then used it in a property requiring those intervals to merge into one. 

Before:
~ touchingNotMerged       flaky: killed in 1/5 runs  by: the output is sorted
    Counterexample: [[[-2147483640,-2147483640],[-2147483642,-2147483640]]]

After:
✔ touchingNotMerged       killed  by: merges touching intervals into one; input order does not affect the result
    Counterexample: [[[0,1],[1,2]]]
    AssertionError: expected [ [ +0, 1 ], [ 1, 2 ] ] to deeply equal [ [ +0, 2 ] ]


### 3. Reading a counterexample

Paste one counterexample that the mutation runner printed for a killed
mutant. In 2–3 sentences, explain using the *specification* why that input
exposes the bug.

Counterexample: [[[0,1],[1,2]]]

The specification says intervals are closed, so [0, 1] and [1, 2] share the 
point 1 and must merge into [0, 2]. The mutant leaves them separate, violating the requirement that consecutive output intervals neither overlap nor touch.

### 4. Your project

Name one function or module in your team's project that would benefit from
property-based testing. State two properties in English, name the pattern of
each, and describe the generator you'd need, including anything about its
inputs that a naive generator would get wrong.

"loadAIPolicy" loads my AI-use policy from .opencode/ai-policy.json

A Round trip pattern: writing any valid policy as JSON and then loading it should return "loaded" with the same policy values

Metamorphic pattern: starting with a valid policy, removing any required field should change the result from "loaded" to "invalid"

The generator should create valid policy objects, write them insdie temporary project dictionaries, and pass those directories to the function. For the second property, for example, it should remove one of "courseName, assignmentName, summary, etc"

A naive generator could generate nonempty strings but they might just contain white space. Both arrays could exist but currently empty arrays are valid. 

