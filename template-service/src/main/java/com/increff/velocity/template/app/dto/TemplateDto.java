package com.increff.velocity.template.app.dto;

import com.increff.velocity.template.app.model.TemplateInfo;
import com.nextscm.commons.spring.common.ApiException;
import com.nextscm.commons.spring.common.ApiStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class TemplateDto {

    @Autowired
    private ResourceLoader resourceLoader;

    @Value("${template.directory:templates}")
    private String templateDirectory;
    
    @Value("${template.storage.path:#{null}}")
    private String templateStoragePath;

    public List<String> getAllTemplates() {
        List<String> templates = new ArrayList<>();
        try {
            ResourcePatternResolver resolver = ResourcePatternUtils.getResourcePatternResolver(resourceLoader);
            Resource[] resources = resolver.getResources("classpath:templates/*.fo.vm");
            templates = Arrays.stream(resources)
                    .map(resource -> {
                        try {
                            String path = resource.getURI().toString();
                            return path.substring(path.lastIndexOf('/') + 1);
                        } catch (IOException e) {
                            e.printStackTrace();
                            return null;
                        }
                    })
                    .filter(name -> name != null)
                    .collect(Collectors.toList());
        } catch (IOException e) {
            // Log error
            e.printStackTrace();
        }
        return templates;
    }
    
    public List<TemplateInfo> getAllTemplatesInfo() {
        List<TemplateInfo> templates = new ArrayList<>();
        try {
            ResourcePatternResolver resolver = ResourcePatternUtils.getResourcePatternResolver(resourceLoader);
            Resource[] resources = resolver.getResources("classpath:templates/*.fo.vm");
            templates = Arrays.stream(resources)
                    .map(resource -> {
                        try {
                            String path = resource.getURI().toString();
                            String fileName = path.substring(path.lastIndexOf('/') + 1);
                            String type = determineTemplateType(fileName);
                            long size = resource.contentLength();
                            return new TemplateInfo(
                                    fileName,
                                    type,
                                    size,
                                    path
                            );
                        } catch (IOException e) {
                            e.printStackTrace();
                            return null;
                        }
                    })
                    .filter(template -> template != null)
                    .collect(Collectors.toList());
        } catch (IOException e) {
            // Log error
            e.printStackTrace();
        }
        return templates;
    }
    
    /**
     * Save a template file to the templates directory
     * @param file The template file to save
     * @param overwrite Whether to overwrite an existing file with the same name
     * @return Information about the saved template
     * @throws IOException If there is an error saving the file
     * @throws ApiException If the file already exists and overwrite is false
     */
    public TemplateInfo saveTemplate(MultipartFile file, boolean overwrite) throws IOException, ApiException {
        // Determine storage path
        String storagePath = getTemplateStoragePath();
        Path storageDirectory = Paths.get(storagePath);
        
        // Create directory if it doesn't exist
        if (!Files.exists(storageDirectory)) {
            Files.createDirectories(storageDirectory);
        }
        
        // Get the original file name
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new ApiException(ApiStatus.UNKNOWN_ERROR, "Invalid file name");
        }
        
        // Create the target file path
        Path targetPath = storageDirectory.resolve(originalFilename);
        
        // Check if file already exists
        if (Files.exists(targetPath) && !overwrite) {
            throw new ApiException(ApiStatus.UNKNOWN_ERROR, 
                "Template with name '" + originalFilename + "' already exists. Use 'overwrite=true' to replace it.");
        }
        
        // Save the file
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        
        // Return information about the saved template
        String fileType = determineTemplateType(originalFilename);
        return new TemplateInfo(
            originalFilename,
            fileType,
            Files.size(targetPath),
            targetPath.toString()
        );
    }
    
    /**
     * Get the storage path for template files
     * @return The absolute path to the templates directory
     */
    private String getTemplateStoragePath() {
        // If template storage path is defined in properties, use it
        if (templateStoragePath != null && !templateStoragePath.isEmpty()) {
            return templateStoragePath;
        }
        
        // Otherwise, use the classpath templates directory
        try {
            Resource resource = resourceLoader.getResource("classpath:templates");
            if (resource.exists()) {
                return resource.getFile().getAbsolutePath();
            }
        } catch (IOException e) {
            // Fall back to creating a templates directory in the current working directory
        }
        
        // If classpath resource doesn't exist or can't be accessed, create directory in user's home
        return System.getProperty("user.home") + File.separator + "templates";
    }
    
    private String determineTemplateType(String fileName) {
        fileName = fileName.toLowerCase();
        if (fileName.contains("invoice")) {
            return "invoice";
        } else if (fileName.contains("label") || fileName.contains("box")) {
            return "label";
        } else if (fileName.contains("packslip") || fileName.contains("packing")) {
            return "packslip";
        } else {
            return "other";
        }
    }
    
    /**
     * Get the content of a specific template by name
     * @param templateName The name of the template to retrieve, including extension
     * @return The content of the template as a string
     * @throws IOException If the template cannot be found or read
     */
    public String getTemplateContent(String templateName) throws IOException {
        try {
            // First try to find in the storage directory
            Path storageDirectory = Paths.get(getTemplateStoragePath());
            Path templatePath = storageDirectory.resolve(templateName);
            
            if (Files.exists(templatePath)) {
                // Read from file system
                return new String(Files.readAllBytes(templatePath));
            }
            
            // If not found, try to find in the classpath
            Resource resource = resourceLoader.getResource("classpath:templates/" + templateName);
            if (!resource.exists()) {
                throw new IOException("Template not found: " + templateName);
            }
            
            byte[] contentBytes = Files.readAllBytes(Paths.get(resource.getURI()));
            return new String(contentBytes);
        } catch (IOException e) {
            throw new IOException("Error reading template content: " + e.getMessage(), e);
        }
    }
} 