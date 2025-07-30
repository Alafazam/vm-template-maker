package com.increff.velocity.template.app.model;

public class TemplateInfo {
    private String name;
    private String type;
    private long size;
    private String path;

    public TemplateInfo() {
    }

    public TemplateInfo(String name, String type, long size, String path) {
        this.name = name;
        this.type = type;
        this.size = size;
        this.path = path;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
} 