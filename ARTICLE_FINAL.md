# Eling: A Chatbot That Actually Remembers You

Most chatbots have total amnesia. Close the chat, come back tomorrow — it doesn't know your name, your peanut allergy, or your deadlines. Every session starts from zero, and you're stuck re-introducing yourself forever.

Eling ("remember" in Javanese) is a Telegram companion built to fix exactly that. Tell it you're allergic to peanuts today; ask "what food is safe for me?" next week and it answers from memory, not from guesses. It speaks Indonesian, English, and Mandarin. And its memory follows you across devices: start a conversation on Telegram, continue it in the paired web widget, and it's still the same Eling that knows you.

I built it for Walrus Session 8: Chatbots That Remember, with Walrus Memory as its memory layer and Google's Gemini as its brain.

## How the memory works

Every message passes through three steps.

**Recall before reply.** Before answering, Eling recalls relevant facts from Walrus Memory and injects them into the system prompt as a plain list of facts — with a hard rule: never invent a memory that isn't on the list. This is the whole trick. The LLM doesn't "try to remember"; it reads.

**One namespace per user.** Each Telegram user gets their own Walrus Memory namespace (`eling:u{telegram_id}`). Namespace isolation is built into Walrus Memory, so user A's recall can never surface user B's facts. One bot, many users, each with a private memory.

**Save in the background.** After replying, the bot extracts atomic facts from the conversation ("user is allergic to peanuts"), deduplicates each against existing memories, and writes new ones with `remember_and_wait()`.

A six-digit `/pair` code links the web widget to the same namespace — that's the cross-device moment: a fact told on your phone is recallable from the browser.

One production scar: Gemini returned 503 overload errors in the middle of a demo, so Eling now runs an automatic model fallback chain. If the primary model fails, it silently tries the next one. Users never notice.

## Before / after

Without memory, the same question gets a shrug: "I don't know what you're allergic to." With Eling, the stored fact — recalled by embedding similarity days later — becomes the answer: "No peanuts! You're allergic — I still remember from last week."

The 45-second demo video walks through this exact moment: three facts go in as ordinary chat messages, seven days pass, and the allergy question is answered from the stored memory, not from the prompt. You can also run `/memories` in the bot at any time to see everything it has stored about you. No black box.

## Three things Walrus Memory taught me

**`remember()` is append-only, not upsert.** Save the same fact twice and you get two entries that both show up in recall. Fix it app-side: recall first, skip the write when something very close (distance < 0.25) already exists.

**Recall without a threshold returns filler.** Even a tiny namespace returns the K "nearest" results, relevant or not. Filtering by distance (< 0.8, calibrated to your own data) is mandatory before injecting anything into a prompt.

**Indexing lags.** `remember()` returns before the fact is recallable. For flows that need immediate consistency — like showing `/memories` right after saving — use the `*AndWait` variants.

## Try it

- Bot: https://t.me/ElingWalz_bot
- Demo (45s): [VIDEO_URL]
- Landing page: https://eling-landing-nxrskyaas-projects.vercel.app/
- Code (MIT): https://github.com/nxrskyaa/eling

Run it yourself: `pip install -r requirements.txt`, fill in `.env` (Telegram token, free Gemini key, Walrus Memory delegate key), then `python bot.py`.
