function main() {
  const functionName = "main"; // Please set the function name of this function.

  // Please set your API key for using Gemini API.
  const apiKey = "###";

  // Please set your label names on Gmail and the description of the label. Please modify this for your situation.
  const labelObj = [
    { label: "academic", description: "Related to university, laboratory, research, education, and etc." },
    { label: "commission", description: "Related to a comission, a request, a job offer, orders, and etc." },
    { label: "advertisement", description: "Related to advertisement, new product, and etc." },
    { label: "INBOX", description: "Others" },
  ];

  const n = 5; // Number of emails in one API call.

  const triggerTime = 10; // In this case, the script is automatically run every 10 minutes.

  const res = new AddLabel({ functionName, apiKey, labelObj, n, triggerTime }).run();
  console.log(res);
}
