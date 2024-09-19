/**
 * Class object for automtically adding labels to Gmail using Gemini API.
 * Author: Kanshi Tanaike
 * Repository: https://github.com/tanaikech/Flexible-Labeling-for-Gmail-using-Gemini-API-with-Google-Apps-Script-Part-3
 * @class
 */
class AddLabel {

  /**
    * @param {Object} object Object using this script.
    * @param {String} object.functionName Function name of the function you run.
    * @param {String} object.apiKey API key for using Gemini API.
    * @param {Object[]} object.labelObj Label names on Gmail and the description of the label.
    * @param {Number} object.n Number of emails in one API call. Default is 5.
    * @param {Number} object.triggerTime Cycle time for executing the script. Default is 10. The unit is minute.
    */
  constructor(object) {
    /** @private */
    this.object = object;

    /** @private */
    this.now = new Date();

    /** @private */
    this.p = PropertiesService.getScriptProperties();

    /** @private */
    this.prev = this.p.getProperty("prev");
  }

  /**
   * ### Description
   * Main method.
   *
   * @return {String} Return result value.
   */
  run() {
    this.checkObject_();
    const messages = this.getNewMessages_();
    const res = this.callGemini_(messages);
    this.setTrigger_(this.object.functionName);
    return res;
  }

  /**
   * ### Description
   * Check the inputted object.
   *
   * @return {void}
   * @private
   */
  checkObject_() {
    if (!this.object.functionName) {
      throw new Error("Please set functionName.");
    }
    if (!this.object.apiKey) {
      throw new Error("Please set apiKey.");
    }
    if (!this.object.labelObj || !Array.isArray(this.object.labelObj)) {
      throw new Error("Please set valid labelObj.");
    }
    if (!this.object.labelObj.some(({ label }) => label == "INBOX")) {
      this.object.labelObj.push({ label: "INBOX", description: "Others" });
    }
    if (!this.object.n) {
      this.object.n = 5;
    }
    if (!this.object.triggerTime) {
      this.object.triggerTime = 10;
    }
  }

  /**
   * ### Description
   * Get threads of Gmail.
   *
   * @return {Object} Return an object including thread IDs and messages.
   * @private
   */
  getNewMessages_() {
    const nowTime = this.now.getTime();
    if (!this.prev) {
      this.prev = nowTime - 60 * 60 * 1000; // If you run this script for the first time or prev is undefined, emails from your inbox in the past 1 hour are retrieved.
    }
    const threads = GmailApp.getInboxThreads().filter(t => t.getLastMessageDate().getTime() > Number(this.prev));
    this.p.setProperty("prev", nowTime.toString());
    if (threads.length == 0) return [];
    const res = threads.map(thread => {
      const lastMessageDate = thread.getLastMessageDate().getTime();
      const lastMessage = thread.getMessages().find((m) => m.getDate().getTime() == lastMessageDate);
      return { threadId: thread.getId(), message: lastMessage.getPlainBody() };
    });
    return res;
  }

  /**
   * ### Description
   * Request Gemini API.
   *
   * @param {Array} labelObj Array including label names.
   * @param {Array} messages Array including thread IDs and messages from Gmail.
   * @return {Object} Return an object including thread IDs and messages.
   * @private
   */
  createPrompt_(labelObj, messages) {
    const jsonSchema1 = {
      description: "Emails including threadId and message.",
      type: "array",
      items: {
        type: "object",
        properties: {
          threadId: { description: "Thread ID of Gmail.", type: "string" },
          message: { description: "Email body.", type: "string" },
        },
      },
    };

    const jsonSchema2 = {
      description: "List of labels including descriptions of the labels.",
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { description: "Label name.", type: "string" },
          description: { description: "Description of the label.", type: "string" },
        },
      },
    };

    const jsonSchema3 = {
      description: `Select the label names from "Array1".`,
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { description: "Selected label name.", type: "string" },
          threadId: { description: "Thread ID of Gmail.", type: "string" },
        },
      },
    };

    const prompt = [
      `Run the following steps in order.`,
      `1. Read and understand the messages from the following array including JSON data "Array1".`,
      `<Array1>${JSON.stringify(messages)}</Array1>`,
      `JSON schema "JsonSchema1" of this array is as following JSON schema "JsonSchema1".`,
      `<JsonSchema1>${JSON.stringify(jsonSchema1)}</JsonSchema1>`,
      `2. Read and understand the following array "Array2".`,
      `<Array2>${JSON.stringify(labelObj)}</Array2>`,
      `JSON schema "JsonSchema2" of this array is as following JSON schema "JsonSchema2".`,
      `<JsonSchema2>${JSON.stringify(jsonSchema2)}</JsonSchema2>`,
      `3. For each element in "Array1", export a single element including the selected label from "Array2" strongly related to the message.`,
      `Output the result with the following JSON schema "JsonSchema3".`,
      `<JsonSchema3>${JSON.stringify(jsonSchema3)}</JsonSchema3>`,
      `<IMPORTANT>`,
      `- One element in "Array1" must have only one label name.`,
      `- Length of "Array1" must be the same length of output array "JsonSchema3".`,
      `</IMPORTANT>`,
    ].join("\n");
    return prompt;
  }

  /**
   * ### Description
   * Request Gemini API.
   *
   * @param {Array} messages Array including thread IDs and messages from Gmail.
   * @return {Object} Return an object including thread IDs and messages.
   * @private
   */
  callGemini_(messages) {
    const len = messages.length;
    if (len > 0) {
      const n = this.object.n;
      const splitMessages = [...Array(Math.ceil(messages.length / n))].map(_ => messages.splice(0, n));
      splitMessages.forEach(msgs => {
        const q = this.createPrompt_(this.object.labelObj, msgs);
        const g = new GeminiWithFiles.geminiWithFiles({ apiKey: this.object.apiKey, response_mime_type: "application/json", exportTotalTokens: true });
        const { returnValue, usageMetadata } = g.generateContent({ q });
        if (!returnValue || !Array.isArray(returnValue)) {
          console.warn("Gemini returns invalid value. Those mails will be processed again.");
          this.p.setProperty("prev", this.prev.toString());
        } else {
          returnValue.forEach(({ label, threadId }) => {
            if (label && label != "INBOX") {
              const thread = GmailApp.getThreadById(threadId);
              console.log(`Mail subject: ${thread.getMessages()[0].getSubject()}, labeled to "${label}"`);
              console.log(`Token information for Gemini: totalTokenCount is ${usageMetadata.totalTokenCount}.`);
              const l = GmailApp.getUserLabelByName(label) || GmailApp.createLabel(label);
              GmailApp.getThreadById(threadId).moveToArchive().addLabel(l).refresh();
            }
          });
        }
      });
    }
    return `${this.now.toISOString()}: ${len} mails were processed.`;
  }

  /**
   * ### Description
   * Request Gemini API.
   *
   * @param {String} functionName Function name.
   * @return {void}
   * @private
   */
  setTrigger_(functionName) {
    ScriptApp.getProjectTriggers().forEach(t => {
      if (t.getHandlerFunction() == functionName) {
        ScriptApp.deleteTrigger(t);
      }
    });
    ScriptApp.newTrigger(functionName).timeBased().everyMinutes(this.object.triggerTime).create();
  }

}
