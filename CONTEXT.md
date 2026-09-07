# Pet-care Trivia

Pet-care trivia lets players answer shared questions about caring for a chosen kind of pet, then compare their results. A game supports solo play or a group of players.

## Language

### Players and joining

**Player**:
A participant in a particular game, represented by a character and credited with their own answers and score.
_Avoid_: User, account, voter

**Character**:
The named avatar that represents a player within a game. Each player in the same game has a different character.
_Avoid_: Pet, animal

**Game code**:
The shareable code that identifies a game for joining.
_Avoid_: Room code, lobby code

**Lobby**:
The preparation stage of a game, where players join, choose characters, choose shared settings, and mark themselves ready to start.
_Avoid_: Room

**Ready to start**:
A player's indication that they are prepared to begin the game. Everyone in the lobby must be ready before question preparation begins.
_Avoid_: Ready, start vote

### Subject and settings

**Pet type**:
The kind of pet that the game's questions are about, such as dogs or cats.
_Avoid_: Character, species

**Care topic**:
The area of pet care covered by the game's questions, such as diet and nutrition or homes and habitats.
_Avoid_: Theme, quiz theme

**Question count**:
The chosen number of questions for a game.

**Answering time limit**:
The maximum allotted time for players to answer each question. Answering can finish sooner when every player has submitted an answer.
_Avoid_: Game duration, round duration

### Questions and answers

**Question**:
A pet-care trivia item with a prompt, answer choices, a correct answer, and an explanation.

**Answer choice**:
One of the possible responses offered for a question.
_Avoid_: Answer, vote

**Answer**:
A player's submitted selection for a particular question. The player may change that selection while answering remains open.
_Avoid_: Vote

**Correct answer**:
The single answer choice designated as correct for a question.

**Explanation**:
The educational note accompanying a question that explains the correct answer or the underlying pet-care lesson.

**Ready to continue**:
A player's indication that they have finished reviewing the current question's explanation. Agreement from all players ends that review early, moving to the next question or, after the last question, the game results.
_Avoid_: Ready, skip vote

### Scores and results

**Score**:
The number of questions a player answered correctly in a game. Incorrect and unanswered questions contribute nothing, and answering speed does not affect the score.
_Avoid_: Speed score

**Leaderboard**:
The list of players ordered by their scores, highest first.

**Question results**:
The correct answer and the players' selections for one question.
_Avoid_: Results, votes

**Game results**:
The final leaderboard and question-by-question answer breakdown for a finished game.
_Avoid_: Results, round results
