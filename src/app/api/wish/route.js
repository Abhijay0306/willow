export async function POST(request) {
  try {
    const { wish } = await request.json();

    if (!wish) {
      return Response.json({ error: "No wish provided" }, { status: 400 });
    }

    const apiKey = process.env.WILLOW_DEEPSEEK_API_KEY;
    
    if (!apiKey || apiKey === "your_deepseek_api_key_here") {
      return Response.json({ 
        error: "DeepSeek API key is not configured. Please add it to .env.local" 
      }, { status: 500 });
    }
    
    console.log("Using API key:", apiKey.trim().substring(0, 5) + "..." + apiKey.trim().substring(apiKey.trim().length - 4));
    console.log("Length of API key:", apiKey.length);
    console.log("Length of trimmed:", apiKey.trim().length);


    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a Monkey's Paw entity. The user will make a wish. You must grant the wish in a realistic way, but introduce a twist that progressively turns dark, unsettling, or tragic as they realize the logical consequences of what they asked for. If the user asks for a negative, harmful, or destructive wish, twist it in a completely unexpected, ironic, and counter-intuitive way that subverts their dark intentions. DO NOT start your response with the word 'Granted'. Keep your response under 3 sentences."
          },
          {
            role: "user",
            content: `I wish for: ${wish}`
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", errorText);
      return Response.json({ error: "Failed to communicate with DeepSeek API." }, { status: 500 });
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;

    return Response.json({ result: resultText });

  } catch (error) {
    console.error("Error in wish API:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
