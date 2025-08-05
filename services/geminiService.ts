import { GoogleGenAI } from "@google/genai";
import { Case } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Summarize the following case description in two short sentences for a mobile app view: ${text}`,
      config: {
        systemInstruction: "You are an expert at creating concise, actionable summaries for field service technicians.",
        temperature: 0.5,
        thinkingConfig: { thinkingBudget: 0 } // Low latency for UI
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error summarizing text with Gemini API:", error);
    return "Could not generate summary.";
  }
};

// A helper function to build a summary prompt from report data
const formatReportForSummary = (caseData: Case): string => {
  let reportContent = `Verification Type: ${caseData.verificationType}\n`;
  reportContent += `Customer: ${caseData.customer.name}\n`;
  reportContent += `Outcome: ${caseData.verificationOutcome || 'Not specified'}\n`;

  // A generic way to pull data from any of the report objects
  const getReportData = (caseObj: Case) => {
    for (const key in caseObj) {
      if (key.endsWith('Report') && caseObj[key as keyof Case]) {
        return caseObj[key as keyof Case] as any;
      }
    }
    return null;
  };
  
  const reportData = getReportData(caseData);

  if (reportData) {
    // Add key fields that are common across many reports
    const keyFields: { [key: string]: string } = {
        finalStatus: "Final Status",
        metPerson: "Met Person (Name)",
        metPersonName: "Met Person (Name)",
        metPersonRelation: "Met Person (Relation)",
        metPersonStatus: "Met Person (Status)",
        otherObservation: "Agent's Observation",
        otherExtraRemark: "Agent's Observation",
        feedbackFromNeighbour: "Neighbour Feedback",
    };
    
    reportContent += "\n--- Key Findings ---\n";
    for (const key in keyFields) {
        if (reportData[key]) {
            reportContent += `${keyFields[key]}: ${reportData[key]}\n`;
        }
    }
  } else {
    reportContent += "No detailed report data found to summarize.\n";
  }

  return reportContent;
};

export const summarizeReport = async (caseData: Case): Promise<string> => {
  const reportText = formatReportForSummary(caseData);
  if (!reportText) {
    return "No report data available to summarize.";
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Summarize the key findings from the following field verification report in 3-4 concise bullet points for a manager's review. Focus on the outcome, who was met, and any critical observations.\n\nReport Data:\n${reportText}`,
      config: {
        systemInstruction: "You are an AI assistant that creates clear, brief summaries of field verification reports for case managers.",
        temperature: 0.3,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error summarizing report with Gemini API:", error);
    return "Could not generate summary due to an API error.";
  }
};