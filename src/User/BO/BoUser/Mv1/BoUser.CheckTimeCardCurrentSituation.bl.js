"use strict";

///////////////////////////////////////////////////////////////////////////////////////////////
//                 IMPORTANT - DO NOT MODIFY AUTO-GENERATED CODE OR COMMENTS                 //
//Parts of this file are auto-generated and modifications to those sections will be          //
//overwritten. You are allowed to modify:                                                    //
// - the tags in the jsDoc as described in the corresponding section                         //
// - the function name and its parameters                                                    //
// - the function body between the insertion ranges                                          //
//         "Add your customizing javaScript code below / above"                              //
//                                                                                           //
// NOTE:                                                                                     //
// - If you have created PRE and POST functions, they will be executed in the same order     //
//   as before.                                                                              //
// - If you have created a REPLACE to override core function, only the REPLACE function will //
//   be executed. PRE and POST functions will be executed in the same order as before.       //
//                                                                                           //
// - For new customizations, you can directly modify this file. There is no need to use the  //
//   PRE, POST, and REPLACE functions.                                                       //
//                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Use the following jsDoc tags to describe the BL function. Setting these tags will
 * change the runtime behavior in the mobile app. The values specified in the tags determine
 * the name of the contract file. The filename format is “@this . @function .bl.js”.
 * For example, LoVisit.BeforeLoadAsync.bl.js
 * -> function: Name of the businessLogic function.
 * -> this: The LO, BO, or LU object that this function belongs to (and it is part of the filename).
 * -> kind: Type of object this function belongs to. Most common value is "businessobject".
 * -> async: If declared as async then the function should return a promise.
 * -> param: List of parameters the function accepts. Make sure the parameters match the function signature.
 * -> module: Use CORE or CUSTOM. If you are a Salesforce client or an implementation partner, always use CUSTOM to enable a seamless release upgrade.
 * -> extends: Base class of the LO, BO, and LU objects that this function belongs to.
 * -> maxRuntime: Maximum time this function is allowed to run, takes integer value in ms. If the max time is exceeded, error is logged.
 * -> returns: Type and variable name in which the return value is stored.
 * @function checkTimeCardCurrentSituation
 * @this BoUser
 * @kind businessobject
 * @async
 * @namespace CORE
 * @param {Object} timeCard
 * @returns promise
 */
function checkTimeCardCurrentSituation(timeCard){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
var promise;
var messageCollector = new MessageCollector();
var runningTimeEntry;
var blCloseTimeEntry = false;

if (!Utils.isDefined(timeCard)) {
  if (me.getShowTimecardInfo() === '1') {
    messageCollector.add({
      "level" : "warning",
      "objectClass" : "BoUser",
      "messageID" : "CasBoUserNoOpenTimeCard"
    });
  }
}
else if (Utils.isDefined(timeCard.getLoUsrTimeEntry())) {
  var loTimeEntries = timeCard.getLoUsrTimeEntry().getItemObjects();

  for (var idxloTimeEntries = 0; idxloTimeEntries < loTimeEntries.length; idxloTimeEntries++) {
    //Find Running TimeEntry
    var timeEntriesSystemTimeThruIsMinDate = loTimeEntries[idxloTimeEntries].getSystemTimeThru() === Utils.getMinDate();
    if (loTimeEntries[idxloTimeEntries].getUsrTimeEntryMetaPKey() !== timeCard.getBoUserDocMeta().getWorkUsrTimeEntryMetaPKey() && timeEntriesSystemTimeThruIsMinDate) {
      if (loTimeEntries[idxloTimeEntries].getUsrTimeEntryMetaPKey() === timeCard.getBoUserDocMeta().getBreakUsrTimeEntryMetaPKey()) {
        var breakReturn = {
          "timeEntryPKey" : loTimeEntries[idxloTimeEntries].getPKey(),
          "effectiveUTCTimeFrom" : loTimeEntries[idxloTimeEntries].getEffectiveUTCTimeFrom(),
          "running" : "1"
        };

        breakReturn.getTimeEntryPKey = function () {return me.timeEntryPKey;};
        breakReturn.getEffectiveUTCTimeFrom = function () {return me.effectiveUTCTimeFrom;};
        breakReturn.getRunning = function () {return me.running;};
        messageCollector.destroy();
        promise = when.resolve(breakReturn);
        break;
      }

      runningTimeEntry = loTimeEntries[idxloTimeEntries];
      break;
    }

  }

  if (!Utils.isDefined(promise) && Utils.isDefined(runningTimeEntry) && runningTimeEntry.getUsrTimeEntryMetaPKey() !== timeCard.getBoUserDocMeta().getBreakUsrTimeEntryMetaPKey()) { //Created by Call.
    messageCollector.add({
      "level" : "warning",
      "objectClass" : "BoUser",
      "messageID" : "CasBoUserRunningTimeEntryByCall",
      "messageParams" : {
        "subject" : runningTimeEntry.getDescription(),
        "startTime" : runningTimeEntry.getEffectiveTimeFrom()
      }
    });
    blCloseTimeEntry = true;
  }
}

if(!Utils.isDefined(promise)){
  if (messageCollector.getCount() > 0) {
    var buttonValues = {};
    buttonValues[Localization.resolve("OK")] = "ok";
    var messages = messageCollector.getMessages().join("<br>");
    promise = MessageBox.displayMessage(Localization.resolve("MessageBox_Title_Warning"), messages, buttonValues).then(
      function () {
        messageCollector.destroy();
        if (blCloseTimeEntry) {
          timeCard.closeTimeEntry(runningTimeEntry.getPKey(), false);
          timeCard.setObjectStatus(STATE.DIRTY | STATE.PERSISTED);
        }
      });
  } else {
    messageCollector.destroy();
    promise = when.resolve();
  }
}

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    return promise;
}