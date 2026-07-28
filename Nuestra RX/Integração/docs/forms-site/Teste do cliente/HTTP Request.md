{
  "errorMessage": "Bad gateway - the service failed to handle your request",
  "errorDescription": "validation_error",
  "errorDetails": {
    "rawErrorMessage": [
      "502 - \"{\\\"ok\\\":false,\\\"step\\\":\\\"update_session\\\",\\\"status\\\":400,\\\"session_id\\\":\\\"8ca3f269-10b4-4362-99ab-9b432d43d9df\\\",\\\"lead_id\\\":247490,\\\"error\\\":{\\\"detail\\\":{\\\"error\\\":\\\"validation_error\\\",\\\"error_code\\\":400,\\\"error_subcode\\\":\\\"REQUEST_VALIDATION_FAILED\\\",\\\"message\\\":\\\"Invalid answer '06/26/1995' for question 6404.\\\",\\\"action_required\\\":\\\"Please review the highlighted fields below and correct any validation errors before resubmitting\\\",\\\"field_errors\\\":[{\\\"field\\\":\\\"Answer\\\",\\\"message\\\":\\\"Invalid answer '06/26/1995' for question 6404.\\\",\\\"action_required\\\":\\\"Choose one of the valid options: Yes, No\\\",\\\"error_subcode\\\":\\\"INVALID_ANSWER_CHOICE\\\",\\\"severity\\\":\\\"medium\\\",\\\"technical_details\\\":{\\\"field_path\\\":\\\"body -> answers\\\",\\\"error_type\\\":\\\"invalid_choice\\\",\\\"question_id\\\":6404,\\\"question_type\\\":\\\"radio\\\",\\\"valid_options\\\":[\\\"Yes\\\",\\\"No\\\"],\\\"received_answer\\\":\\\"06/26/1995\\\"}}]}}}\""
    ],
    "httpCode": "502"
  },
  "n8nDetails": {
    "nodeName": "HTTP Request3",
    "nodeType": "n8n-nodes-base.httpRequest",
    "nodeVersion": 4.3,
    "itemIndex": 0,
    "time": "08/06/2026, 18:46:54",
    "n8nVersion": "1.123.5 (Self Hosted)",
    "binaryDataMode": "default",
    "stackTrace": [
      "NodeApiError: Bad gateway - the service failed to handle your request",
      "    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:859:16)",
      "    at processTicksAndRejections (node:internal/process/task_queues:105:5)",
      "    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+sdk-trace-base@1.30_ec37920eb95917b28efaa783206b20f3/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1045:8)",
      "    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+sdk-trace-base@1.30_ec37920eb95917b28efaa783206b20f3/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1226:11)",
      "    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+sdk-trace-base@1.30_ec37920eb95917b28efaa783206b20f3/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1662:27",
      "    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+sdk-trace-base@1.30_ec37920eb95917b28efaa783206b20f3/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2274:11"
    ]
  }
}