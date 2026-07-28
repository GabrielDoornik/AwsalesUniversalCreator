# NuestraRx Dosable Tenant 64 - AWSales AI Handoff Schema

Generated: 2026-05-28
Tenant: **64** (vertical: weightloss)
Total questions: 33

## Endpoint

- **URL:** `https://webhook.nuestrarx.com/ai-handoff`
- **Method:** `POST`
- **Auth:** `Authorization: Bearer <AI_HANDOFF_SECRET>` (shared out-of-band)
- **Content-Type:** `application/json`
- **Returns:** `{ ok, session_id, lead_id, checkout_url, product, plan, tenant_id }`

## Payload rules

- Send each answer as: { "<id>": { "value": <v>, "question": "<title>" } }
- For type=checkbox, value MUST be a JSON array of strings from valid_options.
- For type=radio, value MUST be one of the literal strings in valid_options.
- For type=textarea, value is free string (use "none" when nothing to report).
- Hard stops are server-enforced. See policy section.

## Body example

```json
{
  "contact": {
    "first_name": "Maria",
    "last_name": "Santos",
    "email": "maria@example.com",
    "phone": "3055551212",
    "lead_state": "FL",
    "zip_code": "33101",
    "gender": "female",
    "birthday": "01/15/1985"
  },
  "answers": {
    "6403": {
      "value": "Female",
      "question": "Biological sex"
    },
    "6411": {
      "value": [
        "None of the above"
      ],
      "question": "Conditions checkbox"
    },
    "6418": {
      "value": "Yes, I can inject myself or have reliable help"
    },
    "6431": {
      "value": "Yes"
    },
    "6432": {
      "value": "Yes"
    },
    "6433": {
      "value": "Yes"
    }
  },
  "product": "semaglutide",
  "plan": "monthly"
}
```

## Hard stops policy

Server-enforced. These responses end the funnel.

| Question ID | Rule |
|---|---|
| `6404` | pregnancy=Yes -> DISQUALIFY |
| `6409` | BMI consent=No -> DISQUALIFY |
| `6411` | Disqualifying conditions (auto-stop) checkbox values: Gastroparesis (Paralysis of your intestines); Triglycerides over 600 at any point; Pancreatic cancer or pancreatitis; Type 1 Diabetes/Insulin-dependent diabetes; Hypoglycemia (low blood sugar); Personal or family history of medullary thyroid cancer; Personal or family history of Multiple Endocrine Neoplasia (MEN-2) syndrome; Anorexia or bulimia; Liver failure/liver cirrhosis; Chronic Kidney Disease Stage 3b or greater; Syndrome of Inappropriate Antidiuretic hormone; Current symptomatic gallstones |
| `6415` | gastric bypass=Yes -> DISQUALIFY |
| `6416` | drug allergies to any GLP-1 listed -> DISQUALIFY (only safe: None of the above) |
| `6418` | self-injection=No (oral) -> DISQUALIFY if oral not offered |
| `6420` | dose reduction acceptance=No -> DISQUALIFY |
| `6421` | dose reduction acceptance=No -> DISQUALIFY |
| `6431` | final consent required |
| `6432` | final consent required |
| `6433` | final consent required |

## Products

| Med | Rush campaign_product_id | Medivera campaign_product_id | Price |
|---|---|---|---|
| semaglutide | `1147` | `55` | $179 |
| tirzepatide | `1151` | `56` | $279 |

> Pending CEO decision: Rush vs Medivera. Use Rush as default until confirmed.

## Questions (33)

### `6400` - textarea - Please identify all your current medical conditions

_(mapped_field: `medicalConditions`) -> next `6401`_

### `6401` - textarea - Please list all your current medications including dosages

_(mapped_field: `selfReportedMeds`) -> next `6402`_

### `6402` - textarea - Please list all of your known allergies

_(mapped_field: `allergies`) -> next `6403`_

### `6403` - radio - What was your sex assigned at birth?

_(mapped_field: `sex`)_

Valid options:
- `Male`
- `Female`

### `6404` - radio - Are you currently pregnant, breastfeeding or planning to become pregnant? **[HARD STOP]**

Valid options:
- `Yes`
- `No`

### `6405` - consent - Consent (pregnancy): These medications are not safe to use during pregnancy or while breastfeeding, as they may pose risks to a developing baby. The FDA advises using extra contraception because these medications can reduce the effectiveness of oral birth control. If you use oral contraceptives, continue them with a barrier method (such as condoms) for the first month after starting treatment and for one month after any dose increase. You may also choose to switch to a non-oral contraceptive method (like an IUD or implant) before starting. After stopping the medication, continue using a backup method for at least two months to ensure it has fully cleared from your system before trying to conceive. **[HARD STOP]**

Valid options:
- `I acknowledge that I have read and understood the above information`
- `I have read the above information and I do not wish to continue`

### `6406` - textarea - What was the highest weight that you have reached?

_ -> next `6407`_

### `6407` - textarea - What is your height in feet and inches?

_ -> next `6408`_

### `6408` - textarea - What is your weight in pounds?

_ -> next `6409`_

### `6409` - consent - Consent (BMI): Weight loss medications are traditionally prescribed for individuals with a BMI of 30 or higher, or for those who are overweight (BMI 25-29) with a related health condition. Using these medications for someone in the 25–29 BMI range without another health condition is considered “off-label” use. This means the medication is being prescribed in a way not specifically approved by the U.S. Food and Drug Administration (FDA). Please follow your prescribed regimen closely and report any side effects or concerns. **[HARD STOP]**

Valid options:
- `I acknowledge that I have read and understood the above information`
- `I have read the above information and I do not wish to continue`

### `6410` - radio - How would you describe your current approach to weight management?

_ -> next `6411`_

Valid options:
- `Actively managing`
- `Some efforts`
- `No active efforts`

### `6411` - checkbox - Please check all current or past medical conditions: **[HARD STOP]**

_ -> next `6415`_

Valid options:
- `Gastroparesis (Paralysis of your intestines)`
- `Triglycerides over 600 at any point`
- `Pancreatic cancer or pancreatitis`
- `Type 1 Diabetes/Insulin-dependent diabetes`
- `Hypoglycemia (low blood sugar)`
- `Personal or family history of medullary thyroid cancer`
- `Personal or family history of Multiple Endocrine Neoplasia (MEN-2) syndrome`
- `Anorexia or bulimia`
- `Liver failure/liver cirrhosis`
- `Chronic Kidney Disease Stage 3b or greater`
- `Syndrome of Inappropriate Antidiuretic hormone`
- `Current symptomatic gallstones`
- `Current gallstones without symptoms`
- `Past removal of your gallbladder`
- `Hypothyroidism, Hyperthyroidism, or Thyroid Issues`
- `None of the above`

### `6412` - consent - Gallstone Consent: Use of GLP-1 medications, including semaglutide, tirzepatide, and similar products, has been associated with an increased risk of gallbladder or biliary issues, including the development or worsening of gallstones. If you have existing but asymptomatic gallstones, treatment may increase the chance that these stones become symptomatic, potentially leading to pain, inflammation, or the need for medical or surgical treatment. Please notify your provider if you have a history of gallstones or experience new upper abdominal pain, nausea, or vomiting during therapy. Knowing this risk, do you wish to continue? **[HARD STOP]**

Valid options:
- `I acknowledge that I have read and understood the above information and wish to continue.`
- `I have read the above information and I do not wish to continue`

### `6413` - consent - Cholecystectomy Consent: You reported a history of gallbladder disease or gallbladder removal. This medication may still be appropriate, but it can affect how your body digests fats and bile. Without a gallbladder, bile flow and fat digestion are altered, which may increase the risk of side effects like stomach pain or diarrhea. This medication may also impact absorption of certain nutrients (especially vitamins A, D, E, and K). To reduce risk, eat smaller, frequent meals, avoid processed foods, and consider a daily multivitamin unless otherwise directed by your provider. If you have gallstones, please note that weight loss and this medication can increase the risk of gallstone formation or blockage, which can cause severe pain, infection, or pancreatitis. Seek immediate medical care for abdominal pain, fever, or vomiting. **[HARD STOP]**

Valid options:
- `I acknowledge that I have read and understood the above information and wish to continue.`
- `I have read the above information and I do not wish to continue`

### `6414` - consent - Thyroid Consent These medications can affect how your body absorbs or responds to thyroid therapy. If you have thyroid disease, your provider may need to adjust your dosage or monitor your thyroid levels more closely after starting treatment. **[HARD STOP]**

Valid options:
- `I acknowledge that I have read and understood the above information`
- `I have read the above information and I do not wish to continue`

### `6415` - radio - Have you had a gastric bypass in the past 6 months? **[HARD STOP]**

Valid options:
- `Yes`
- `No`

### `6416` - checkbox - Are you allergic to any of the following? **[HARD STOP]**

Valid options:
- `Ozempic (Semaglutide)`
- `Mounjaro (Tirzepatide)`
- `Wegovy (Semaglutide)`
- `Zepbound (Tirzepatide)`
- `Saxenda (Liraglutide)`
- `Trulicity (dulaglutide)`
- `None of the above`

### `6417` - checkbox - Are you currently, or have you in the past two months, taken any of the following medications?

_ -> next `6418`_

Valid options:
- `Semaglutide (Ozempic, Wegovy, Rybelsus)`
- `Tirzepatide (Zepbound, Mounjaro)`
- `None of these`

### `6418` - radio - Are you able to safely give yourself injections or have someone help you? **[HARD STOP]**

Valid options:
- `No, I'd need an oral option instead (Direct to oral formulation or disqualified if not offered)`
- `Yes, I can inject myself or have reliable help`

### `6419` - radio - When did you last take your prescribed weight loss medication?

_ -> next `6422`_

Valid options:
- `Within the past week`
- `Within the past 2-3 weeks`
- `It has been over a month`

### `6420` - radio - I'm so sorry, but these medications gradually build up in your system. Since you've been off this medication for an extended period, it's safest to restart at a lower dose, typically about 50% of your previous dose, and titrate back up. Restarting at a high dose after a break can cause significant side effects, sometimes requiring emergency care or hospitalization. Would you like to continue with a lower starting dose? **[HARD STOP]**

Valid options:
- `I understand and agree to the dose reduction`
- `I do not agree and do not wish to continue`

### `6421` - radio - I'm so sorry, but these medications gradually build up in your system. Since you've been off this medication for an extended period, it's safest to restart at the starter dose and titrate back up. Restarting at a high dose after a break can cause significant side effects, sometimes requiring emergency care or hospitalization. Would you like to continue with a lower starting dose? **[HARD STOP]**

Valid options:
- `I understand and agree to the dose reduction`
- `I do not agree and do not wish to continue`

### `6422` - textarea - Please provide the approximate date (month and day) of your last use of this medication

_ -> next `6423`_

### `6423` - radio - Which medication and dose most closely matches your most recent dose?

_ -> next `6424`_

Valid options:
- `Semaglutide (Ozempic/Wegovy) 0.25mg`
- `Semaglutide (Ozempic/Wegovy) 0.5mg`
- `Semaglutide (Ozempic/Wegovy) 1mg`
- `Semaglutide (Ozempic/Wegovy) 1.5 or 1.7mg`
- `Semaglutide (Ozempic/Wegovy) 2.0mg`
- `Semaglutide (Ozempic/Wegovy) 2.4mg`
- `Tirzepatide (Mounjaro/Zepbound) 2.5mg`
- `Tirzepatide (Mounjaro/Zepbound) 5mg`
- `Tirzepatide (Mounjaro/Zepbound) 7.5mg`
- `Tirzepatide (Mounjaro/Zepbound) 10mg`
- `Tirzepatide (Mounjaro/Zepbound) 12.5mg`
- `Tirzepatide (Mounjaro/Zepbound) 15mg`

### `6424` - radio - Are you currently using a brand name medication (like Wegovy or Zepbound) or a compounded version?

Valid options:
- `I'm taking a brand name medication`
- `I'm taking a compounded product`

### `6425` - textarea - Please tell us the name and dose of the compounded medication you're taking, as dose conversions can be confusing and we'll need to complete an extra verification step to confirm accuracy. 1. Concentration - look on your prescription label or vial for something that looks like "20 mg/mL" or "2.5 mg/mL." There may be several numbers which should all be provided. This shows how strong your medication is. 2. Amount you take - write how much you administer, in units or milliliters (mL).

_ -> next `6426`_

### `6426` - radio - How are you responding to your medication?

_ -> next `6427`_

Valid options:
- `I'm not feeling any effects and have no side effects`
- `I'm not feeling any effects but I'm having side effects`
- `I'm feeling the effects but have side effects`
- `I'm feeling the effects and have no side effects`

### `6427` - radio - How would you like to continue your treatment?

_ -> next `6428`_

Valid options:
- `Stay at the same or closest equivalent dose`
- `Increase the dose if possible, or continue current if already at maximum`
- `Decrease my dose`

### `6428` - radio - Do you have a photo of your current prescription? We need this image to verify your current dosage. If we're unable to confirm your prescription, we can only offer the starting dose.

Valid options:
- `Yes I have this information`
- `I don't have this information and I'm okay restarting`

### `6430` - textarea - What other information or questions do you have for the doctor?

_ -> next `6431`_

### `6431` - consent - Consent (Individualized Medication Treatment) We are committed to providing individualized care that considers your unique health needs and preferences. Your treatment plan may include either FDA-approved, brand-name medications or compounded alternatives, depending on what is most appropriate for your situation. ➤ FDA-Approved Brand Name Medications: Zepbound Mounjaro Ozempic Wegovy ➤ Compounded Medications: For patients who may benefit from a more specialized approach, we may recommend compounded formulations of semaglutide and tirzepatide. These customized medications can offer: Alternative dosing schedules Alternative dosing frequencies Different routes of administration Compounded medications are custom-prepared by licensed pharmacists to better meet an individual patient's specific needs. Unlike FDA-approved brand name products, compounded medications are not subject to the same rigorous testing and extensive clinical trials. While this customization can be an advantage, there may be differences in the consistency, efficacy, and safety profiles compared to those of the branded products. ➤ You acknowledge and understand: You have been informed of the available treatment options, including both FDA-approved brand name medications and compounded alternatives. You understand that compounded medications are tailored to meet individual needs but are not subjected to the same level of testing as brand name products. Your treatment plan will be determined based on your candidacy and specific health requirements, ensuring the most appropriate therapy for you. Please review this information carefully and ask any questions you may have. Your health and well-being are our priorities. **[HARD STOP]**

Valid options:
- `I have read and understand the above information and I do consent and wish to move forward with this treatment plan`
- `I have read the above information and I do not wish to continue`

### `6432` - consent - Consent (Truthfulness): Please attest to the following confirming that all information you have provided to us is true and complete. Consent: I verify that I am the patient and that I have answered the questions asked in this intake form. I confirm that I have reviewed and understood all the questions asked of me. I attest that the answers and information I have provided in this questionnaire is true and complete to the best of my knowledge. I understand that it is critical to my health to share complete health information with my doctor. I will not hold the doctor or affiliated medical practice responsible for any oversights or omissions, whether intentional or not, in the information that I provided. **[HARD STOP]**

Valid options:
- `I have read the above information and I do consent and wish to move forward`
- `I have read the above information and I do not wish to continue`

### `6433` - consent - Consent (GLP-1 and GLP-1/GIP) Indication for Use: You are requesting evaluation and treatment with GLP-1 (Ozempic, Wegovy, or compounded semaglutide) or GIP/GLP-1 receptor agonist (Mounjaro, Zepbound, or compounded tirzepatide) for weight or obesity management. These medications work by mimicking incretin hormones that help regulate blood sugar, promote feelings of fullness, and reduce food intake. Potential Benefits: Weight loss or weight management Improved blood glucose control Reduced cardiovascular risk Potential improvement in overall metabolic health Potential Side Effects: While these medications can be beneficial, they can also cause side effects, including emergency room visits, hospitalizations, or even death. Common Side Effects: Nausea Vomiting Diarrhea Constipation Decreased appetite Indigestion Serious Side Effects: Pancreatitis (inflammation of the pancreas) Hypoglycemia (low blood sugar, especially with other diabetes medications) Gallbladder disease (e.g., gallstones) Kidney problems Allergic reactions (e.g., rash, itching, swelling) Gastroparesis (paralysis of the bowels) Risks and Considerations: Pancreatitis: There is a risk of developing pancreatitis while taking these medications. Contact your healthcare provider immediately if you experience severe abdominal pain, nausea, or vomiting. Thyroid Tumors: Animal studies have shown an increased risk of thyroid tumors with certain GLP-1 medications. This risk has not been confirmed in humans. Please inform your healthcare provider if you have a history of thyroid cancer. Hypoglycemia: These medications can cause low blood sugar, especially when taken with other diabetes medications (insulin or sulfonylureas). It is important that your provider knows about all medications you are taking. Kidney Function: These medications may affect kidney function, especially in patients with existing kidney disease. Regular monitoring may be required. Monitoring and Follow-up: Regular follow-up visits to monitor your response and assess for side effects Intermittent requests for full-body selfie images to ensure reported weight consistency Acknowledgement and Consent: I acknowledge the potential benefits, risks, and side effects of GLP-1 or GIP/GLP-1 receptor agonist medications. I understand the importance of regular monitoring and follow-up appointments. I consent to the use of GLP-1 or GIP/GLP-1 receptor agonist medications as part of my treatment plan for overweight or obesity. **[HARD STOP]**

Valid options:
- `I have read and understand the above information and I wish to continue`
- `I have read the above information and I do not wish to continue`
