package com.increff.velocity.template.app.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.increff.velocity.template.app.dto.PdfDto;
import com.nextscm.commons.spring.common.ApiException;
import com.nextscm.commons.spring.common.ApiStatus;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@RestController
@RequestMapping(value = "/api/render-pdf")
@Api(tags = "PDF API")
public class PdfController {

    @Autowired
    private PdfDto pdfDto;
    
    @Autowired
    private ResourceLoader resourceLoader;
    
    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping("")
    @ApiOperation(value = "Render PDF from template and JSON data")
    public String renderPdf(@RequestParam("file") MultipartFile file,
                            @RequestParam("jsonString") String jsonString) throws ApiException, JsonProcessingException {
        byte[] result = pdfDto.renderPdf(file, jsonString);
        return Base64.getEncoder().encodeToString(result);
    }
    
    @PostMapping("/template-upload")
    @ApiOperation(value = "Render PDF using an uploaded template file")
    public String renderPdfFromUploadedTemplate(
            @RequestParam("templateFile") MultipartFile templateFile,
            @RequestParam("jsonData") String jsonData) throws ApiException, JsonProcessingException {
        
        // Validate inputs
        if (templateFile == null || templateFile.isEmpty()) {
            throw new ApiException(ApiStatus.UNKNOWN_ERROR, "Template file is required");
        }
        
        if (jsonData == null || jsonData.isEmpty()) {
            throw new ApiException(ApiStatus.UNKNOWN_ERROR, "JSON data is required");
        }
        
        // Validate JSON
        try {
            objectMapper.readTree(jsonData);
        } catch (JsonProcessingException e) {
            throw new ApiException(ApiStatus.UNKNOWN_ERROR, "Invalid JSON data: " + e.getMessage());
        }
        
        // Render PDF using the uploaded template
        byte[] result = pdfDto.renderPdf(templateFile, jsonData);
        return Base64.getEncoder().encodeToString(result);
    }
    
    @PostMapping("/sample/{templateType}")
    @ApiOperation(value = "Render PDF using sample JSON data")
    public String renderPdfWithSample(
            @RequestParam("file") MultipartFile file,
            @PathVariable("templateType") String templateType) throws ApiException, IOException {
        
        // Load appropriate sample JSON based on template type
        String sampleJsonPath = "classpath:sample-" + templateType + ".json";
        Resource resource = resourceLoader.getResource(sampleJsonPath);
        
        if (!resource.exists()) {
            throw new ApiException(ApiStatus.UNKNOWN_ERROR, "Sample JSON not found for template type: " + templateType);
        }
        
        // Read the JSON content
        String jsonString;
        try (Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)) {
            jsonString = FileCopyUtils.copyToString(reader);
        }
        
        // Validate JSON
        try {
            objectMapper.readTree(jsonString);
        } catch (JsonProcessingException e) {
            throw new ApiException(ApiStatus.UNKNOWN_ERROR, "Invalid sample JSON: " + e.getMessage());
        }
        
        // Render PDF
        byte[] result = pdfDto.renderPdf(file, jsonString);
        return Base64.getEncoder().encodeToString(result);
    }
    
    @PostMapping("/template/{templateName}")
    @ApiOperation(value = "Render PDF using a template from resources")
    public String renderPdfWithResourceTemplate(
            @PathVariable("templateName") String templateName,
            @RequestParam("jsonString") String jsonString) throws ApiException, IOException {
        
        // Load template from resources
        String templatePath = "classpath:templates/" + templateName;
        Resource templateResource = resourceLoader.getResource(templatePath);
        
        if (!templateResource.exists()) {
            throw new ApiException(ApiStatus.UNKNOWN_ERROR, "Template not found: " + templateName);
        }
        
        // Read template content
        String templateContent;
        try (Reader reader = new InputStreamReader(templateResource.getInputStream(), StandardCharsets.UTF_8)) {
            templateContent = FileCopyUtils.copyToString(reader);
        }
        
        // Validate JSON
        try {
            objectMapper.readTree(jsonString);
        } catch (JsonProcessingException e) {
            throw new ApiException(ApiStatus.UNKNOWN_ERROR, "Invalid JSON: " + e.getMessage());
        }
        
        // Render PDF using template content
        byte[] result = pdfDto.renderPdfFromString(templateContent, jsonString);
        return Base64.getEncoder().encodeToString(result);
    }
    
    @PostMapping("/template/{templateName}/sample/{templateType}")
    @ApiOperation(value = "Render PDF using a template from resources and sample JSON")
    public String renderPdfWithResourceTemplateAndSample(
            @PathVariable("templateName") String templateName,
            @PathVariable("templateType") String templateType) throws ApiException, IOException {
        
        // Load template from resources
        String templatePath = "classpath:templates/" + templateName;
        Resource templateResource = resourceLoader.getResource(templatePath);
        
        if (!templateResource.exists()) {
            throw new ApiException(ApiStatus.UNKNOWN_ERROR, "Template not found: " + templateName);
        }
        
        // Read template content
        String templateContent;
        try (Reader reader = new InputStreamReader(templateResource.getInputStream(), StandardCharsets.UTF_8)) {
            templateContent = FileCopyUtils.copyToString(reader);
        }
        
        // Load appropriate sample JSON based on template type
        String sampleJsonPath = "classpath:sample-" + templateType + ".json";
        Resource jsonResource = resourceLoader.getResource(sampleJsonPath);
        
        if (!jsonResource.exists()) {
            throw new ApiException(ApiStatus.UNKNOWN_ERROR, "Sample JSON not found for template type: " + templateType);
        }
        
        // Read the JSON content
        String jsonString;
        try (Reader reader = new InputStreamReader(jsonResource.getInputStream(), StandardCharsets.UTF_8)) {
            jsonString = FileCopyUtils.copyToString(reader);
        }
        
        // Validate JSON
        try {
            objectMapper.readTree(jsonString);
        } catch (JsonProcessingException e) {
            throw new ApiException(ApiStatus.UNKNOWN_ERROR, "Invalid sample JSON: " + e.getMessage());
        }
        
        // Render PDF using template content and sample data
        byte[] result = pdfDto.renderPdfFromString(templateContent, jsonString);
        return Base64.getEncoder().encodeToString(result);
    }
}
