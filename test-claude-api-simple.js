// Simple test of Claude API streaming
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testStreaming() {
  console.log('Testing Claude API streaming...');
  console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);

  try {
    const stream = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Say hello in 5 words' }],
      stream: true,
    });

    console.log('Stream created successfully');
    let fullText = '';

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        fullText += event.delta.text;
        process.stdout.write(event.delta.text);
      }
    }

    console.log('\n\nFull response:', fullText);
    console.log('✓ Streaming works!');
  } catch (error) {
    console.error('✗ Error:', error.message);
    if (error.status) console.error('Status:', error.status);
  }
}

testStreaming();
