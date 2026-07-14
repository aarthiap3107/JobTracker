package com.jobtracker.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import java.util.Base64;
import java.util.Map;

@Service
public class AiService {

    @Value("${gemini.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    public Map<String, Object> analyzeResume(byte[] pdfBytes) throws Exception {
        String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);

        ObjectNode req = objectMapper.createObjectNode();
        ArrayNode contents = req.putArray("contents");
        ObjectNode content = contents.addObject();
        ArrayNode parts = content.putArray("parts");

        ObjectNode pdfPart = parts.addObject();
        ObjectNode inlineData = pdfPart.putObject("inline_data");
        inlineData.put("mime_type", "application/pdf");
        inlineData.put("data", base64Pdf);

        ObjectNode textPart = parts.addObject();
        textPart.put("text",
            "Analyze this resume and return ONLY valid JSON with this exact structure:\n" +
            "{\"score\":<integer 0-100>,\"summary\":\"<2-3 sentence overall assessment>\"," +
            "\"strengths\":[\"<s1>\",\"<s2>\",\"<s3>\"],\"weaknesses\":[\"<w1>\",\"<w2>\"]," +
            "\"suggestions\":[\"<s1>\",\"<s2>\",\"<s3>\"]}\n" +
            "Score: clarity 20%, skills 25%, experience 25%, formatting 15%, achievements 15%. " +
            "Reply with ONLY the JSON object, no markdown."
        );

        String responseText = callGemini(req);
        int start = responseText.indexOf('{');
        int end   = responseText.lastIndexOf('}');
        if (start == -1 || end == -1 || end <= start)
            throw new Exception("Model did not return valid JSON");
        responseText = responseText.substring(start, end + 1);
        JsonNode parsed = objectMapper.readTree(responseText);
        return objectMapper.convertValue(parsed, Map.class);
    }

    public String generateCoverLetter(String companyName, String jobTitle, String jobDescription) throws Exception {
        ObjectNode req = objectMapper.createObjectNode();
        ArrayNode contents = req.putArray("contents");
        ObjectNode content = contents.addObject();
        ArrayNode parts = content.putArray("parts");

        String extra = (jobDescription != null && !jobDescription.isBlank())
            ? "\nJob Description: " + jobDescription : "";

        ObjectNode textPart = parts.addObject();
        textPart.put("text",
            "Write a professional cover letter for:\nCompany: " + companyName +
            "\nPosition: " + jobTitle + extra +
            "\n\nRequirements:\n- 3-4 paragraphs (opening, skills/experience, why this company, closing)\n" +
            "- Use 'I' as writer perspective\n- 250-350 words\n- No placeholders\n\n" +
            "Return only the cover letter text."
        );

        return callGemini(req);
    }

    private String callGemini(ObjectNode requestBody) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                API_URL + apiKey, HttpMethod.POST, entity, String.class);
            JsonNode json = objectMapper.readTree(response.getBody());
            return json.get("candidates").get(0).get("content").get("parts").get(0).get("text").asText();
        } catch (HttpClientErrorException e) {
            String body = e.getResponseBodyAsString();
            String msg = null;
            try {
                JsonNode err = objectMapper.readTree(body);
                String extracted = err.path("error").path("message").asText("");
                if (!extracted.isBlank()) msg = extracted;
            } catch (Exception ignored) {}
            throw new Exception(msg != null ? msg : "Gemini API error " + e.getStatusCode() + ": " + body);
        }
    }
}
