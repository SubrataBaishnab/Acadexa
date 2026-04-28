const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Generate smart recommendation chat response
 */
const generateRecommendationResponse = async (student, recommendations, query) => {
  try {
    const prompt = `
You are a helpful academic advisor assistant for a thesis management system. 
A student with the following profile is looking for supervision recommendations:

Student Profile:
- Research Interests: ${student.researchInterests?.join(', ') || 'Not specified'}
- Academic Level: ${student.academicLevel || 'Undergraduate'}
- Preferred Countries: ${student.preferredCountries?.join(', ') || 'Any'}
- Skills: ${student.skills?.join(', ') || 'Not specified'}

Top Recommendations Based on Their Profile:
${recommendations.slice(0, 5).map((rec, idx) => `
${idx + 1}. ${rec.firstName} ${rec.lastName}
   - Research Areas: ${(rec.researchAreas || []).join(', ')}
   - Match Score: ${rec.matchScore?.toFixed(1) || 'N/A'}%
   - Match Reason: ${rec.matchReason}
`).join('\n')}

Student Question: "${query}"

Provide a helpful, concise response (2-3 sentences) that:
1. Addresses the student's question
2. References relevant recommendations if applicable
3. Provides actionable next steps
    `;

    console.log('Calling OpenAI API...');
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful academic advisor assistant.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    console.log('OpenAI API response received successfully');
    return completion.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chatbot response:', {
      message: error.message,
      type: error.constructor.name,
      status: error.status,
    });
    throw new Error(`Failed to generate recommendation: ${error.message}`);
  }
};

/**
 * Generate email draft for contacting a professor
 */
const generateEmailDraft = async (student, professor, researchContext) => {
  try {
    const prompt = `
Generate a professional email draft for a student reaching out to a professor about PhD applications.

Student Information:
- Name: ${student.firstName} ${student.lastName}
- University: ${student.university || 'Not specified'}
- Research Interests: ${student.researchInterests?.join(', ') || 'Not specified'}

Professor Information:
- Name: Prof. ${professor.firstName} ${professor.lastName}
- University: ${professor.university}
- Research Areas: ${(professor.researchAreas || []).join(', ')}

Research Context: ${researchContext}

Generate a professional, concise email (150-200 words) that:
1. Introduces the student professionally
2. Explains why they're interested in the professor's research
3. Briefly mentions relevant qualifications
4. Expresses interest in discussing PhD opportunities
5. Ends with a polite call to action

Format the response with the subject line and email body separated by "---"
    `;

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at writing professional academic emails.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const response = completion.data.choices[0].message.content;
    const [subject, body] = response.split('---').map(s => s.trim());

    return {
      subject: subject || 'Inquiry Regarding PhD Opportunities',
      body: body || response,
    };
  } catch (error) {
    console.error('Error generating email draft:', error);
    throw new Error('Failed to generate email draft');
  }
};

module.exports = {
  generateRecommendationResponse,
  generateEmailDraft,
};
