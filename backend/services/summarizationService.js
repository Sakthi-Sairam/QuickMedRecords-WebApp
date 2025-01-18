import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  systemInstruction:
    `Summarize the following health record in a concise and doctor-friendly format. The output should be 7-8 lines long (if there is not enough data give in 4-5 lines) and include:
    Patient Demographics (name, age, gender, etc.)
    Key Medical History (diagnoses, surgeries, allergies)
    Current Medications and Prescriptions
    Summary of recent doctor visits and findings
    lifestyle modifications that the patient should make
    Key Precautions and Advice for the Patient: Medication adherence, follow-up appointments, and any specific dos and don'ts.
    Important Considerations for the Doctor: Ensure patient understanding, address patient concerns, and document all interactions thoroughly.
    Do not include individual summaries for each doctor visit.`,
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Summarize health record
async function generateHealthRecordSummary(healthRecord) {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: JSON.stringify(healthRecord),
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage("Summarize the health record");
  return result.response.text();
}

export { generateHealthRecordSummary };
