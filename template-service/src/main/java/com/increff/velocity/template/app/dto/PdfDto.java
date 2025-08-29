package com.increff.velocity.template.app.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.increff.commons.template.Resources;
import com.increff.commons.template.util.FopUtil;
import com.increff.commons.template.util.Utils;
import com.increff.commons.template.util.VelocityUtil;
import com.nextscm.commons.spring.common.ApiException;
import com.nextscm.commons.spring.common.ApiStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.SAXException;

import org.apache.fop.configuration.ConfigurationException;
import javax.xml.transform.TransformerException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

import org.apache.velocity.runtime.parser.ParseException;

@Service
public class PdfDto {

    @Autowired
    private ObjectMapper objectMapper;

    public byte[] renderPdf(MultipartFile file, String jsonString) throws ApiException, JsonProcessingException {
        System.out.println("=== PDF RENDER FLOW START ===");
        System.out.println("Input JSON string length: " + (jsonString != null ? jsonString.length() : "null"));
        System.out.println("Input JSON string: " + jsonString);
        System.out.println("File name: " + (file != null ? file.getOriginalFilename() : "null"));
        System.out.println("File size: " + (file != null ? file.getSize() : "null"));
        
        Object form = convertToObject(jsonString);
        System.out.println("Converted form object type: " + (form != null ? form.getClass().getName() : "null"));
        System.out.println("Converted form object: " + form);
        
        convertDateFields(form);
        System.out.println("After date conversion, form object: " + form);
        
        String timeZoneStr = "Asia/Kolkata";
        System.out.println("Using timezone: " + timeZoneStr);
        
        String templateResource = null;
        try {
            templateResource = new String(file.getBytes(), StandardCharsets.UTF_8);
            System.out.println("Template resource length: " + (templateResource != null ? templateResource.length() : "null"));
            System.out.println("Template resource (first 200 chars): " + 
                (templateResource != null ? templateResource.substring(0, Math.min(200, templateResource.length())) : "null"));
        } catch (IOException e) {
            System.out.println("ERROR reading file: " + e.getMessage());
            throw new ApiException(ApiStatus.UNKNOWN_ERROR, "Error while reading the file, message: " + e.getMessage());
        }
        try {
            System.out.println("Calling getPdfFromVm...");
            byte[] result = getPdfFromVm(form, templateResource, timeZoneStr);
            System.out.println("PDF generation successful, result size: " + (result != null ? result.length : "null"));
            System.out.println("=== PDF RENDER FLOW END ===");
            return result;
        } catch (ApiException e) {
            System.out.println("ERROR in getPdfFromVm: " + e.getMessage());
            throw new ApiException(ApiStatus.UNKNOWN_ERROR, "Error while generating the PDF, message: " + e.getMessage());
        }
    }
    
    public byte[] renderPdfFromString(String templateContent, String jsonString) throws ApiException, JsonProcessingException {
        System.out.println("=== PDF RENDER FROM STRING FLOW START ===");
        System.out.println("Template content length: " + (templateContent != null ? templateContent.length() : "null"));
        System.out.println("Template content (first 200 chars): " + 
            (templateContent != null ? templateContent.substring(0, Math.min(200, templateContent.length())) : "null"));
        System.out.println("JSON string: " + jsonString);
        
        Object form = convertToObject(jsonString);
        System.out.println("Converted form object: " + form);
        
        convertDateFields(form);
        System.out.println("After date conversion: " + form);
        
        String timeZoneStr = "Asia/Kolkata";
        try {
            byte[] result = getPdfFromVm(form, templateContent, timeZoneStr);
            System.out.println("=== PDF RENDER FROM STRING FLOW END ===");
            return result;
        } catch (ApiException e) {
            System.out.println("ERROR in renderPdfFromString: " + e.getMessage());
            throw new ApiException(ApiStatus.UNKNOWN_ERROR, "Error while generating the PDF, message: " + e.getMessage());
        }
    }

    public byte[] getPdfFromVm(Object form, String templateResource, String timeZoneStr) throws ApiException {
        VelocityUtil.setTimezone(timeZoneStr);
        String fopTemplate = null;
        try {
            // Debug: Print the form data
            System.out.println("=== DEBUG: PDF Generation ===");
            System.out.println("Form data type: " + (form != null ? form.getClass().getName() : "null"));
            System.out.println("Form data: " + form);
            
            fopTemplate = VelocityUtil.processString(form, templateResource);
            
            // Debug: Print the processed template (first 500 chars)
            System.out.println("Processed template (first 500 chars): " + 
                (fopTemplate != null ? fopTemplate.substring(0, Math.min(500, fopTemplate.length())) : "null"));
            
            // Debug: Check for Arabic characters in the template
            if (fopTemplate != null && fopTemplate.contains("حسين")) {
                System.out.println("Arabic text found in template: حسين");
            } else {
                System.out.println("No Arabic text found in template");
            }
            
            // Debug: Check for Arabic characters in the form data
            if (form != null && form.toString().contains("حسين")) {
                System.out.println("Arabic text found in form data: حسين");
            } else {
                System.out.println("No Arabic text found in form data");
            }
            
            System.out.println("=== END DEBUG ===");
        }
        catch (ParseException e) {
            throw new ApiException(ApiStatus.UNKNOWN_ERROR,"Error while processing template, message: " + e.getMessage());
        }
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try{
            FopUtil.convertToPDF(Resources.getResource(Resources.FOP_DATA_RESOURCE), Utils.toStream(fopTemplate), byteArrayOutputStream);
        } catch (TransformerException | SAXException | IOException | ConfigurationException e ) {
            throw new ApiException(ApiStatus.UNKNOWN_ERROR,"Error while creating pdf. "+e.getMessage());
        }
        return byteArrayOutputStream.toByteArray();
    }

    private Object convertToObject(String jsonString) throws JsonProcessingException {
        System.out.println("=== CONVERT TO OBJECT ===");
        System.out.println("Input JSON string: " + jsonString);
        Object result = objectMapper.readValue(jsonString, Object.class);
        System.out.println("Converted object type: " + (result != null ? result.getClass().getName() : "null"));
        System.out.println("Converted object: " + result);
        System.out.println("=== END CONVERT TO OBJECT ===");
        return result;
    }

    public static void convertDateFields(Object jsonObject) {
        System.out.println("=== CONVERT DATE FIELDS START ===");
        System.out.println("Input object: " + jsonObject);
        convertDateFieldsRecursive(jsonObject);
        System.out.println("After date conversion: " + jsonObject);
        System.out.println("=== CONVERT DATE FIELDS END ===");
    }

    private static void convertDateFieldsRecursive(Object obj) {
        if (obj instanceof Map<?, ?>) {
            Map<Object, Object> originalMap = (Map<Object, Object>) obj;
            Map<Object, Object> updatedMap = new LinkedHashMap<>();

            originalMap.forEach((key, value) -> {
                if (value instanceof String && isDateString((String) value)) {
                    Date date = parseDateString((String) value);
                    if (date != null) {
                        updatedMap.put(key, date);
                    } else {
                        updatedMap.put(key, value);
                    }
                } else {
                    convertDateFieldsRecursive(value);
                    updatedMap.put(key, value);
                }
            });

            originalMap.clear();
            originalMap.putAll(updatedMap);
        } else if (obj instanceof List<?>) {
            List<Object> list = (List<Object>) obj;
            List<Object> updatedList = new ArrayList<>();

            list.forEach(item -> {
                if (item instanceof Map<?, ?> || item instanceof List<?>) {
                    convertDateFieldsRecursive(item);
                    updatedList.add(item);
                } else {
                    updatedList.add(item);
                }
            });

            list.clear();
            list.addAll(updatedList);
        }
    }


    private static boolean isDateString(String value) {
        String datePattern = "\\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s\\d{1,2}\\s\\d{2}:\\d{2}:\\d{2}\\s\\w{3}\\s\\d{4}\\b";
        return value.matches(datePattern);
    }

    private static Date parseDateString(String dateString) {
        try {
            return new SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy", Locale.ENGLISH).parse(dateString);
        } catch (java.text.ParseException e) {
            e.printStackTrace();
            return null;
        }
    }
}
