window.getUrlParameter = function getUrlParameter(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
	    sURLVariables = sPageURL.split('&'),
	    sParameterName,
	    i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};

// PoC file upload for prototype
// TODO:: handle cancel 
// TODO:: add additional items 
(function () {
  var inputs = document.querySelectorAll('.file-upload__input');
  Array.prototype.forEach.call(inputs, function (input) {
    var label = input.nextElementSibling,
      labelVal = label.innerHTML;

    input.addEventListener('change', function (e) {
      var fileName = '';

      fileName = e.target.value.split('\\').pop();

      if (fileName) {
        label.querySelector('.file-upload__file-name').innerHTML = fileName;
        label.querySelector('.file-upload__file-name').classList.add('file-upload__file-name--uploaded');
        label.querySelector('.uikit-btn').innerHTML = 'Remove';
        label.querySelector('.uikit-btn').classList.add('uikit-btn--tertiary');

        $('.file-upload--add').show();

        var status = label.querySelector('.file-upload__file-name').closest('tr');

        status = status.querySelector('.file-status');
        status.innerHTML = 'Remove';
        status.innerHTML = '<span class="sr"> Uploaded</span>';
        status = status.classList;
        status.remove('file-status--required');
        status.add('file-status--uploaded');

      } else {

        label.innerHTML = labelVal;
      }
    });
  });
}());

window.initStudents = function(params) {
  var studentNameFirst = localStorage.getItem('studentNameFirst');
  // get the name from storage 
  if (localStorage.getItem('studentNameFirst')) {
    // add '
    var apostrophe = "'";
    // add s to ' if student's name doesn't end in s
    if (localStorage.getItem('studentNameFirst').slice(-1) !== "s") {
      apostrophe = apostrophe + "s";
    }
  }

  var studentNameFirstApostrophed = localStorage.getItem('studentNameFirst') + apostrophe;
  // only for veteran and parent/guardian flows
  if (("veteranFlow" in localStorage) || ("claimantFlow" in localStorage)) {

    // both apostrophed and straight names are used in the screens 
    $(".studentNameFirstApostrophed").html(studentNameFirstApostrophed);
    $(".studentNameFirst").html(localStorage.getItem('studentNameFirst'));

  } else {
    $(".studentNameFirstApostrophed").html('');
    $(".studentNameFirst").html('');
  }

  var contentSet = [];
  var contentVeteran = [];
  var contentStudent = [];
  var contentParentGuardian = [];
  var contentMessages = [];

  $.each(studentClaimContent.contents, function (index, element) {

    if (element.veteran) {
      contentVeteran = element.veteran;
    }
    if (element.parentGuardian) {
      contentParentGuardian = element.parentGuardian;
    }
    if (element.student) {
      contentStudent = element.student;
    }
    if (element.messages) {
      contentMessages = element.messages;
    }

  });

  if ("veteranFlow" in localStorage) {
    contentSet = Object.assign({}, contentMessages, contentVeteran);
  }

  if ("claimantFlow" in localStorage) {
    contentSet = Object.assign({}, contentMessages, contentParentGuardian);
  }

  if ("studentFlow" in localStorage) {
    contentSet = Object.assign({}, contentMessages, contentStudent);
  }

  for (var key in contentSet) {
    var content = contentSet[key].replace(/{{studentNameFirstApostrophed}}/g, studentNameFirstApostrophed);
    content = content.replace(/{{studentNameFirst}}/g, studentNameFirst);
    $("#question_" + key).html(content);
  }
}

window.initFlow = function() {
  if ("veteranFlow" in localStorage) {
    $(".pt-flow--veteran").show("fast");
  }

  if ("studentFlow" in localStorage) {
    $(".pt-flow--student").show("fast");
  }

  if ("claimantFlow" in localStorage) {
    $(".pt-flow--claimant").show("fast");
  }
}


//ALL students
$(".pt-showIfDocumentUploadShoppingCart").hide();
$(".pt-final-toggle").hide();

$('input[name=doesStudentHaveTFN]').change(function () {
  if (localStorage.getItem('act') === 'mrca') {
    $('.pt-showIfMRCA').show();
  }

  if ($('input[name=doesStudentHaveTFN]:checked').val() === 'yes') {
    localStorage.removeItem('studentHasTFN');
    localStorage.setItem('studentHasTFN', true);
  } else {
    localStorage.removeItem('studentHasTFN');
    localStorage.removeItem('tfn');
  }
});

$(".upload-list").show();

var studentClaimContent = {
  "_comment_1": "All flows (student, veteran, parentGuardian) are independent i.e. content ids that are the same need to be updated in all flows",
  "_comment_2": "All messages are generic i.e. they are for all flows. Except for some messages within the student flow which are overrides of the generic messages",
  "contents": [
    {
      "student": {
        "pageheader1": "Veteran details",
        "pageheader1a": "Your details",
        "pageheaderStart": "Getting started",
        "pageheaderLiving": "Your living arrangements",
        "pageheaderStudy": "Your study details",
        "pageheaderFinancial": "Financial details",
        "pageheaderFinal": "Your claim for Education Assistance has been&nbsp;<span class='font-weight-heavy'>submitted</span>",
        "id1": "Title",
        "id1a": "Gender",
        "id2": "Given name <span class='hint'>(first name)</span>",
        "id3": "Surname <span class='hint'>(last name)</span>",
        "id4": "Date of birth <span class='hint'>(DD / MM / YYYY)</span>",
        "id5": "The veteran is my",
        "id5a": "",
        "id6": "Are you employed full time? <span class='hint display-block'>This does not include apprenticeships.</span>",
        "id7": "Are you married or in a de facto relationship?",
        "id7a": "Are you living with your partner?",
        "id8": "Are you living away from home for any of the above reasons?",
        "id9": "",
        "id9b": "Provide any supporting documents to prove your relationship to the student.",
        "id10": "Level of study",
        "id11": "Grade this year",
        "id12": "Name of school",
        "id16": "Where are you studying?",
        "id16a": "Institution name",
        "id17": "Course name / degree name",
        "id19": "Date you started studying, or will start studying <span class='hint'>(DD / MM / YYYY)</span>",
        "id20": "Approximate date when you expect to complete your course/degree <span class='hint'>(DD / MM / YYYY)</span>",
        "id21": "Are you studying full time? ",
        "id21a": "Tell us more about your situation. Why are you studying part time? <span class='hint'>(optional)<span class='display-block'>For example, health reasons, isolated location, family situation. </span></span>",
        "id21c": "Have you enrolled?",
        "id21ci": "<b>Save and exit</b> your claim. You can return and continue when you have proof of enrolment.",
        "id22": "Residential address",
        "id22a": "Postal address",
        "id23": "Where are you living?",
        "id24": "What is your living situation?",
        "id24a1": "When did you start renting? <span class='hint'>(DD / MM / YYYY)</span>",
        "id24a7": "How much rent do you pay every 2 weeks?",
        "id24a8": "Do you share the cost of rent with anyone else? ",
        "id24a9": "When did you start boarding / lodging? <span class='hint'>(DD / MM / YYYY)</span>",
        "id24a9a": "How much do you pay in board every 2 weeks? <span class='hint'>(minus the cost of meals)</span>",
        "id24a9b": "Tell us more about your living situation",
        "id26": "Who receives the Family Tax Benefit for the student?",
        "id26a": "What is your Centrelink Customer Reference Number (CRN)?",
        "id26b": "Does someone else receive Family Tax Benefit for the student?",
        "id29": "Account name",
        "id30": "BSB <span class='hint'>(XXX - XXX)</span>",
        "id31": "Account number",
        "id33a": "Are you dependent on the veteran? Or were you previously? <span class='hint'>Completely or substantially</span>",
        "id33b": "Is the veteran significantly injured or deceased because of their service? For example:<span class='hint display-block'> <ul> <li>the veteran has 80 impairment points</li><li>the veteran is totally and permanently impaired</li><li>the veteran is eligible for an extreme disablement adjustment rate</li><li>the veteran is, or was, eligible for the special rate disability pension</li></ul> </span>",
        "id41": "Veteran's title",
        "id42": "Veteran's given name <span class='hint'>(first name)</span>",
        "id43": "Veteran's surname <span class='hint'>(last name)</span>",
        "id44": "Veteran's date of birth <span class='hint'>(DD / MM / YYYY)</span>",
        "id45": "Veteran's DVA file number <span class='hint'>(if known)</span>",
        "id48": "Please provide a brief statement explaining how you came into the veteran’s care. ",
        "id50": "Next steps",
        "id50a": "Apply for a <a href='https://www.ato.gov.au/Individuals/Tax-file-number/Apply-for-a-TFN/' rel='external'>tax file number</a> and avoid paying extra tax.",
        "id51": "Your bank details",
        "id52": "Your tax details",
        "id53": "Would you like DVA to withhold tax from this payment?",
        "id54": "How much would you like to withhold per fortnight for tax? <span class='hint display-block'> For information about payments go to the <a href='https://www.dva.gov.au/factsheet-mrc04-compensation-payment-rates' target='_blank' class='external-link'>DVA website</a></span>",
        "id55": "Do you have a tax file number?",
        "id55a": "Tax file number",
        "message9": "<p>Extra support may be available if you are living away from home for <b>any</b> of the following reasons:</p><ul> <li>you can't access school or university from home</li><li>you have a disability</li><li>you need specialised remedial education</li><li>you are a member of a family with a nomadic lifestyle</li><li>local schools or education facilities can't meet your academic needs</li><li>conditions at home are detrimental to your education</li></ul>",
        "message15": "If your parent or guardian previously received this payment for you, we may need to contact them to confirm you can get the payment.",
        "message16": "<p>You need to apply for a tax file number from the <a class='external-link' href='https://www.ato.gov.au/Individuals/Tax-file-number/Apply-for-a-TFN/'>Australian Taxation Office</a> to avoid your payment being taxed at a higher amount.</p> ",
        "message17": "<p class='margin-below margin-below--mid'>This payment is considered taxable income. If you are approved for this payment and this is your only income this financial year, you may not have to pay any tax.</p><p class='margin-below margin-below--mid'>However, you may have to pay tax if you have other income this financial year, such as salary or wages.</p><p class='margin-below margin-below--mid'>If you think you will have to pay tax, you can ask us to deduct tax instalments from your payment. You can change this amount at any time.</p><p class='margin-below margin-below--mid'>If you're not sure how much tax to have taken out of your payment, go to the <a class='external-link' href='https://www.ato.gov.au/individuals/working/working-as-an-employee/claiming-the-tax-free-threshold/'>Australian Taxation Office website</a> or call the ATO Personal Tax Enquiries Line on <a href='tel:132861'>13 28 61</a>.</p>",
        "message18": " <p>If you are earning other income, such as salary or wages, you may have to pay additional tax at the end of the financial year.</p>",
        "messageeligibilityUnder16": "Students under the age of 16 need their parent or guardian to make the claim.",
        "messageeligibilityOver25": "You may not be eligible if you haven’t started your course. If you enrolled after you turned 25 you are not eligible for education allowance. For more information call <a href='tel:1800555254'> 1800 555 254</a>",
        "messageeligibilityOver25notenrolled": "You are not eligible for education allowance because you are over 25. For more information call <a href='tel:1800555254'> 1800 555 254</a>"
      },
      "veteran": {
        "pageheader1": "Student details",
        "pageheaderStart": "Getting started",
        "pageheaderLiving": "Student's living arrangements",
        "pageheaderStudy": "Student's study details",
        "pageheaderFinancial": "Financial details",
        "pageheaderFinal": "Your claim for Education Assistance has been&nbsp;<span class='font-weight-heavy'>submitted</span>",
        "gender": "Student's gender",
        "id1": "Student's title",
        "id2": "Student's given name <span class='hint'>(first name)</span>",
        "id3": "Student's surname <span class='hint'>(last name)</span>",
        "id4": "Student's date of birth <span class='hint'>(DD / MM / YYYY)</span>",
        "id5StudentToMeTheVet": "The student is my &nbsp;",
        "id5a": "Provide a brief statement explaining how the student came into your care.",
        "id6a": "Is the student employed full time? <span class='hint display-block'>This does not include apprenticeships.</span>",
        "id7": "Is the student married or in a de facto relationship?",
        "id7a": "Is the student living with their partner?",
        "id8": "Is the student living away from home for any of the above reasons?",
        "id9": "Provide a brief statement explaining how the student came into your care. ",
        "id10": "Level of study",
        "id11": "Grade this year",
        "id12": "Name of school",
        "id16": "Where is {{studentNameFirst}} studying?",
        "id16a": "Institution name",
        "id17": "Course name / degree name",
        "id19": "Date that {{studentNameFirst}} started studying, or will start studying <span class='hint'>(DD / MM / YYYY)</span>",
        "id20": "Approximate date that {{studentNameFirst}} expects to complete their course/degree <span class='hint'>(DD / MM / YYYY)</span>",
        "id21": "Is {{studentNameFirst}} studying full time? ",
        "id21a": "Tell us more about {{studentNameFirstApostrophed}} situation. Why is {{studentNameFirst}} studying part time? <span class='hint'>(optional)<span class='display-block'>For example, health reasons, isolated location, family situation. </span></span>",
        "id21c": "Is {{studentNameFirst}} enrolled?",
        "id21ci": "<b>Save and exit</b> your claim. You can return and continue when you have proof of enrolment.",
        "id22": "{{studentNameFirstApostrophed}} residential address ",
        "id22a": "{{studentNameFirstApostrophed}} postal address <span class='hint'>(used for correspondence)</span>",
        "id23": "Where is the student living?",
        "id24": "What is {{studentNameFirstApostrophed}} living situation?",
        "id24a1": "When did {{studentNameFirst}} start renting? <span class='hint'>(DD / MM / YYYY)</span>",
        "id24a8": "Does {{studentNameFirst}} share the cost of rent with anyone else? ",
        "id24a7": "How much rent does {{studentNameFirst}} pay every 2 weeks? ",
        "id24a9": "When did {{studentNameFirst}} start boarding / lodging? <span class='hint'>(DD / MM / YYYY)</span>",
        "id24a9a": "How much does {{studentNameFirst}} pay in board every 2 weeks? <span class='hint'>(minus the cost of meals)</span>",
        "id24a9b": "Tell us more about {{studentNameFirstApostrophed}} living situation.",
        "id26": "Do you receive Family Tax Benefit for the student?",
        "id26a": "What is your Centrelink Customer Reference Number (CRN)?",
        "id26b": "Does someone else receive Family Tax Benefit for the student",
        "id29": "Account name",
        "id30": "BSB <span class='hint'>(XXX - XXX)</span>",
        "id31": "Account number",
        "id33a": "Are you a veteran who is significantly injured as a result of your service?",
        "id42": "Veteran's given name <span class='hint'>(first name)</span>",
        "id43": "Veteran's surname <span class='hint'>(last name)</span>",
        "id44": "Veteran's date of birth <span class='hint'>(DD / MM / YYYY)</span>",
        "id45": "Veteran's DVA file number <span class='hint'>(if known)</span>",
        "id50": "Next steps",
        "id50a": "Have {{studentNameFirst}} apply for a <a href='https://www.ato.gov.au/Individuals/Tax-file-number/Apply-for-a-TFN/' rel='external'>tax file number</a> and avoid paying extra tax.",
        "id51": "Your bank details",
        "id52": "{{studentNameFirstApostrophed}} tax details",
        "id53": "Would you like DVA to withhold tax from this payment?",
        "id54": "How much would you like to withhold per fortnight for tax? <span class='hint display-block'> For information about payments see the <a href='https://www.dva.gov.au/factsheet-mrc04-compensation-payment-rates' target='_blank' class='external-link'>DVA website</a></span>",
        "id55": "Does {{studentNameFirst}} have a tax file number?",
        "id55a": "Tax file number"
      },
      "parentGuardian": {
        "pageheader0": "About the student",
        "pageheader0a": "About the veteran",
        "pageheader0b": "About you",
        "pageheaderStart": "Getting started",
        "pageheaderLiving": "Student's living arrangements",
        "pageheaderStudy": "Student's study details",
        "pageheader1": "Veteran details",
        "pageheader1a": "Student details",
        "pageheaderFinancial": "Financial details",
        "pageheaderFinal": "Your claim for Education Assistance has been&nbsp;<span class='font-weight-heavy'>submitted</span>",
        "gender": "Student's gender",
        "id1": "Student's title",
        "id2": "Student's given name <span class='hint'>(first name)</span>",
        "id3": "Student's surname <span class='hint'>(last name)</span>",
        "id4": "Student's date of birth <span class='hint'>(DD / MM / YYYY)</span>",
        "id5": "The veteran is the student's &nbsp;",
        "id5StudentToMeTheClaimant": "The student is my &nbsp;",
        "id5a": "Provide a brief statement explaining how the student came into the veteran’s care. ",
        "id6": "Is the student employed full time? <span class='hint display-block'>This does not include apprenticeships.</span>",
        "id7": "Is the student married or in a de facto relationship?",
        "id7a": "Is the student living with their partner?",
        "id8": "Is the student living away from home for any of the above reasons?",
        "id9": "What is the veteran's relationship to the student?",
        "id10": "Level of study",
        "id11": "Grade this year",
        "id12": "Name of school",
        "id16": "Where is {{studentNameFirst}} studying?",
        "id16a": "Institution name",
        "id17": "Course name / degree name",
        "id19": "Date that {{studentNameFirst}} started studying, or will start studying <span class='hint'>(DD / MM / YYYY)</span>",
        "id20": "Approximate date that {{studentNameFirst}} expects to complete their course/degree <span class='hint'>(DD / MM / YYYY)</span>",
        "id21": "Is {{studentNameFirst}} studying full time? ",
        "id21a": "Tell us more about {{studentNameFirstApostrophed}} situation. Why is {{studentNameFirst}} studying part time? <span class='hint'>(optional)<span class='display-block'>For example, health reasons, isolated location, family situation. </span></span>",
        "id21c": "Is {{studentNameFirst}} enrolled?",
        "id21ci": "<b>Save and exit</b> your claim. You can return and continue when you have proof of enrolment.",
        "id22": "{{studentNameFirstApostrophed}} residential address ",
        "id22a": "{{studentNameFirstApostrophed}} postal address <span class='hint'>(used for correspondence)</span>",
        "id23": "Where is the student living?",
        "id24": "What is {{studentNameFirstApostrophed}} living situation?",
        "id24a1": "When did {{studentNameFirst}} start renting? <span class='hint'>(DD / MM / YYYY)</span>",
        "id24a8": "Does {{studentNameFirst}} share the cost of rent with anyone else? ",
        "id24a7": "How much rent does {{studentNameFirst}} pay every 2 weeks? ",
        "id24a9": "When did {{studentNameFirst}} start boarding / lodging? <span class='hint'>(DD / MM / YYYY)</span>",
        "id24a9a": "How much does {{studentNameFirst}} pay in board every 2 weeks? <span class='hint'>(minus the cost of meals)</span>",
        "id24a9b": "Tell us more about {{studentNameFirstApostrophed}} living situation.",
        "id26": "Do you receive the Family Tax Benefit for the student?",
        "id26a": "What is your Centrelink Customer Reference Number (CRN)?",
        "id26b": "Does someone else receive Family Tax Benefit for the student?",
        "id29": "Account name",
        "id30": "BSB <span class='hint'>(XXX - XXX)</span>",
        "id31": "Account number",
        "id33a": "Is the student dependent on the veteran? Or were they previously? <span class='hint'>Completely or substantially</span>",
        "id33b": "Is the veteran significantly injured or deceased because of their service? For example:<span class='hint display-block'> <ul> <li>the veteran has 80 impairment points</li><li>the veteran is totally and permanently impaired</li><li>the veteran is eligible for an extreme disablement adjustment rate</li><li>the veteran is, or was, eligible for the special rate disability pension</li></ul> </span>",
        "id35": "Does the veteran provide care for the student or receive the Family Tax Benefit for them?",
        "id42": "Veteran's given name <span class='hint'>(first name)</span>",
        "id43": "Veteran's surname <span class='hint'>(last name)</span>",
        "id44": "Veteran's date of birth <span class='hint'>(DD / MM / YYYY)</span>",
        "id45": "Veteran's DVA file number <span class='hint'>(if known)</span>",
        "id50": "Next steps",
        "id50a": "Have {{studentNameFirst}} apply for a <a href='https://www.ato.gov.au/Individuals/Tax-file-number/Apply-for-a-TFN/' rel='external'>tax file number</a> and avoid paying extra tax.",
        "id47": "The student’s relationship to the veteran",
        "id48": "Please provide a brief statement explaining how the student came into the veteran’s care. ",
        "id51": "Your bank details",
        "id52": "{{studentNameFirstApostrophed}} tax details",
        "id53": "Would you like DVA to withhold tax from this payment?",
        "id54": "How much would you like to withhold per fortnight for tax? <span class='hint display-block'> For information about payments see the <a href='https://www.dva.gov.au/factsheet-mrc04-compensation-payment-rates' target='_blank' class='external-link'>DVA website</a></span>",
        "id55": "Does {{studentNameFirst}} have a tax file number?",
        "id55a": "Tax file number"
      }
    },
    {
      "messages": {
        "message1": "Students over the age of 26 are not eligible for education allowance.",
        "message2": "Students over the age of 18 need to complete the claim themselves.",
        "message3": "The student must be at least 4 years old to claim for education allowance.",
        "message4": "Students who are working full time may not be eligible for education allowance. For more information call 1800 555 254.",
        "message5": "You may not be eligible for education allowance. For more information call 1800 555 254.",
        "message6": "You can't claim both education allowance and Family Tax Benefit (FTB) payments if the student is over 16. Often it is best to choose FTB as it may be a higher payment rate. For FTB information call <a href='tel:136-150'>136 150</a>. For education allowance, call <a href='1800-555-254'>1800 555 254</a>.",
        "message7": "The person receiving Family Tax Benefit will need to claim for education allowance.",
        "message8": "Students who are working full time are not eligible for education allowance. For more information call 1800 555 254.",
        "message9": "<p>Extra support may be available if {{studentNameFirst}} is living away from home for <b>any</b> of the following reasons:</p><ul> <li>the student can't access school or university from home</li><li>the student has a disability</li><li>the student needs specialised remedial education</li><li>the student is a member of a family with a nomadic lifestyle</li><li>local schools or education facilities can't meet the student's academic needs</li><li>conditions at home are detrimental to the student's education</li></ul>",
        "message14": "<p>Click <b>save and next</b> to continue.</p>",
        "message16": "<p>{{studentNameFirst}} needs to apply for a tax file number from the <a class='external-link' href='https://www.ato.gov.au/Individuals/Tax-file-number/Apply-for-a-TFN/'>Australian Taxation Office</a> to avoid the payment being taxed at a higher amount.</p>",
        "message17": "<p class='margin-below margin-below--mid'>This payment is considered the student's taxable income. If the student is approved for this payment and this is their only income this financial year, they may not have to pay any tax.</p><p class='margin-below margin-below--mid'>However, they may have to pay tax if they have other income this financial year, such as salary or wages. </p><p class='margin-below margin-below--mid'>If you think the student will have to pay tax, you can ask us to deduct tax instalments from the payment. You can change this amount at any time.</p><p class='margin-below margin-below--mid'>If you're not sure how much tax to have taken out of this payment, go to the <a class='external-link' href='https://www.ato.gov.au/individuals/working/working-as-an-employee/claiming-the-tax-free-threshold/'>Australian Taxation Office website</a> or call the ATO Personal Tax Enquiries Line on <a href='tel:132861'>13 28 61</a>.</p>",
        "message18": "<p>If the student is earning other income, such as salary or wages, they may have to pay additional tax at the end of the financial year.</p>",
        "message19": "<h3>Your application is being assessed. </h3> <p>You will receive an outcome within 30 days. If you do not hear from us within this time you can call 133 254. You will be notified of your application outcome by mail and a MyGov notification.</p>"
      }
    }
  ]
};