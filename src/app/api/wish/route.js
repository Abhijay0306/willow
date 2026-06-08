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
            content: "You are a Monkey's Paw entity. The user will make a wish. Grant it in a grounded, seemingly innocent way at first, but progressively escalate the logical consequences until the ending becomes absolutely, psychologically twisted and devastating. Don't force the dark turn too abruptly; let it build naturally into a tragic realization. If the wish is already negative, subvert their dark intentions with a completely unexpected, ironic tragedy. DO NOT start your response with the word 'Granted' or similar variants. Keep your response between 3 to 5 sentences to allow the horror to build."
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
