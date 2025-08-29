package com.increff.velocity.template.app.controller;

import com.increff.velocity.template.app.dto.TemplateDto;
import com.increff.velocity.template.app.model.TemplateInfo;
import com.nextscm.commons.spring.common.ApiException;
import com.nextscm.commons.spring.common.ApiStatus;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping(value = "/api/templates")
@Api(tags = "Template API")
public class TemplateController {

    @Autowired
    private TemplateDto templateDto;

    @GetMapping("")
    @ApiOperation(value = "Get all available templates")
    public List<String> getAllTemplates() {
        System.out.println("=== CONTROLLER: GET ALL TEMPLATES ===");
        List<String> templates = templateDto.getAllTemplates();
        System.out.println("Found " + templates.size() + " templates: " + templates);
        System.out.println("=== END GET ALL TEMPLATES ===");
        return templates;
    }
    
    @GetMapping("/info")
    @ApiOperation(value = "Get detailed information about all templates")
    public List<TemplateInfo> getAllTemplatesInfo() {
        return templateDto.getAllTemplatesInfo();
    }
    
    @GetMapping("/{templateName}/content")
    @ApiOperation(value = "Get the content of a specific template")
    public ResponseEntity<String> getTemplateContent(@PathVariable("templateName") String templateName) {
        System.out.println("=== CONTROLLER: GET TEMPLATE CONTENT ===");
        System.out.println("Template name: " + templateName);
        try {
            String content = templateDto.getTemplateContent(templateName);
            System.out.println("Template content length: " + (content != null ? content.length() : "null"));
            System.out.println("Template content (first 200 chars): " + 
                (content != null ? content.substring(0, Math.min(200, content.length())) : "null"));
            System.out.println("=== END GET TEMPLATE CONTENT ===");
            return ResponseEntity.ok(content);
        } catch (IOException e) {
            System.out.println("ERROR getting template content: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/upload")
    @ApiOperation(value = "Upload and save a template file")
    public ResponseEntity<?> uploadTemplate(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "overwrite", defaultValue = "false") boolean overwrite) {
        
        try {
            // Validate template file
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("Template file is required");
            }
            
            String filename = file.getOriginalFilename();
            
            // Basic validation for file type (should end with .fo.vm for Velocity templates)
            if (filename == null || !filename.endsWith(".fo.vm")) {
                return ResponseEntity.badRequest().body("Invalid template file. Template must have .fo.vm extension");
            }
            
            // Save the template
            TemplateInfo savedTemplate = templateDto.saveTemplate(file, overwrite);
            return ResponseEntity.ok(savedTemplate);
            
        } catch (ApiException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error saving template: " + e.getMessage());
        }
    }
} 