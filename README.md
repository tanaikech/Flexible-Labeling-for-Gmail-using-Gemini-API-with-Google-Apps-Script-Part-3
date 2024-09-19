# Flexible Labeling for Gmail using Gemini API with Google Apps Script Part 3

<a name="top"></a>
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENCE)

![](images/fig1.png)

<a name="overview"></a>

# Overview

This report improves Gmail email labeling with Gemini API using JSON schema and leverages advancements in Gemini 1.5 Flash for faster processing.

# Description

As Gemini continues to evolve, existing scripts utilizing its capabilities can be revisited to improve efficiency and accuracy. This includes the process of flexible labeling for Gmail emails using the Gemini API. I have previously explored this topic in two reports:

- December 19, 2023: Demonstrating Gmail label selection based solely on prompts. [Ref](https://medium.com/google-cloud/flexible-labeling-for-gmail-using-gemini-pro-api-with-google-apps-script-5bf2ee7c9f52)
- January 30, 2024: Exploring label selection through both semantic search and function calls. [Ref](https://medium.com/google-cloud/flexible-labeling-for-gmail-using-gemini-pro-api-with-google-apps-script-part-2-08015af6b2e6)

This report introduces a new method for Gmail label selection using a JSON schema with response_mime_type: "application/json". Thanks to Gemini's advancements, content generation speed has significantly improved with the introduction of Gemini 1.5 Flash. Additionally, JSON schema allows for greater control over the output format. Recent research [Ref](https://medium.com/google-cloud/taming-the-wild-output-effective-control-of-gemini-api-response-formats-with-response-schema-ae0097b97502) suggests that this combination outperforms the previous approach using response_mime_type and response_schema separately.

To facilitate the use of the Gemini API with Google Apps Script, a custom library named "GeminiWithFiles" was created. [Ref](https://medium.com/google-cloud/batch-processing-powerhouse-leverage-gemini-1-5-2857fd7fe28d) and [Ref](https://github.com/tanaikech/GeminiWithFiles) This library is also utilized within this report.

This report concludes by presenting the latest script for flexible Gmail email labeling using the Gemini API with Google Apps Script.

# Feature
The feature of this script is as follows.

- **Automated Gmail Labeling**: Automatically add labels to Gmails using the Gemini API with Google Apps Script.
- **Batch Processing**: Process multiple emails efficiently with a single API call. [Ref](https://medium.com/google-cloud/batch-processing-powerhouse-leverage-gemini-1-5-2857fd7fe28d)
- **Structured Data Handling**: Utilize JSON schemas for both input and output data with the Gemini API.
- **Scheduled Execution**: Leverage time-driven triggers for automatic script execution.
- **Cost-Effective and Accurate**: Achieve low processing costs and high accuracy through Gemini 1.5 Flash, JSON schemas, and batch processing.

# Usage

## 1. Create a Google Apps Script project
Please create a Google Apps Script project. In this case, both the container-bound script and the standalone script can be used.

## 2. Create an API key

Please access [https://ai.google.dev/gemini-api/docs/api-key](https://ai.google.dev/gemini-api/docs/api-key) and create your API key. At that time, please enable Generative Language API at the API console. This API key is used for this sample script.

This official document can also be seen. [Ref](https://ai.google.dev/).

Of course, if you can link the Google Cloud Platform Project to the Google Apps Script Project in the copied Spreadsheet, you can also use the access token.

## 3. Install a Google Apps Script library

In this script, a Google Apps Script library GeminiWithFiles is used. Please install it. You can see how to install it [here](https://github.com/tanaikech/GeminiWithFiles?tab=readme-ov-file#1-use-geminiwithfiles-as-a-google-apps-script-library).

## 4. Script: Class object
This is the class object. Please copy and paste [this script](https://github.com/tanaikech/Flexible-Labeling-for-Gmail-using-Gemini-API-with-Google-Apps-Script-Part-3/blob/master/AddLabel.js) to the script editor of your created Google Apps Script project.

## 5. Script: Main function
This is the main function for using the above class object. Please copy and paste the following script to the script editor of your created Google Apps Script project.

Please set your API key and URLs to the function `main`.

```javascript
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
```

## 6: Testing
When you manually run `main` function, the emails are retrieved from "INBOX" of Gmail. And, those mails are processed and your inputted labels are added to the emails. And, the time-driven trigger for automatically executing the script is also installed. By this, the script `main` is automatically run by the installed  time-driven trigger.

---

<a name="licence"></a>

# Licence

[MIT](LICENCE)

<a name="author"></a>

# Author

[Tanaike](https://tanaikech.github.io/about/)

[Donate](https://tanaikech.github.io/donate/)

<a name="updatehistory"></a>

# Update History

- v1.0.0 (September 19, 2024)

  1. Initial release.

[TOP](#top)



