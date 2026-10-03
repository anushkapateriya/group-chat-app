const {
    generateSuggestions
} = require("../services/aiService");

const getSuggestions = async (
    req,
    res
) => {
    try {
        const {
            type,
            message
        } = req.body;

        if (!type || !message || !message.trim()) {
            return res.status(400).json({
                message:
                    "Type and message are required"
            });
        }

        let prompt = "";

        /*
        Predictive typing
        */

        if (type === "typing") {
            prompt = `
You are a chat assistant.

The user is currently typing:
"${message.trim()}"

Suggest exactly 3 possible next words or short phrases.

Rules:
- Keep each suggestion very short.
- Suggestions must naturally continue the user's text.
- Keep them relevant to the context.
- Do not explain anything.
- Return only a JSON array of 3 strings.

Example:
["5 pm", "tomorrow", "the office"]
`;
        }

        /*
        Smart replies
        */

        else if (type === "reply") {
            prompt = `
You are a chat assistant.

The user received this message:
"${message.trim()}"

Generate exactly 3 short possible replies.

Rules:
- Keep replies natural and conversational.
- Each reply should be concise.
- Match the context of the incoming message.
- Do not explain anything.
- Return only a JSON array of 3 strings.

Example:
[
    "Yes, I'll be there.",
    "Running late, will join soon.",
    "Can we reschedule?"
]
`;
        }

        else {
            return res.status(400).json({
                message:
                    "Invalid suggestion type"
            });
        }

        const result =
            await generateSuggestions(
                prompt
            );

        let suggestions;

        try {
            suggestions =
                JSON.parse(result);
        } catch (error) {
            return res.status(500).json({
                message:
                    "Invalid AI response"
            });
        }

        if (
            !Array.isArray(
                suggestions
            )
        ) {
            return res.status(500).json({
                message:
                    "Invalid AI response"
            });
        }

        return res.status(200).json({
            suggestions:
                suggestions.slice(0, 3)
        });

    } catch (error) {
        console.error(
            "AI suggestion error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to generate suggestions"
        });
    }
};

module.exports = {
    getSuggestions
};