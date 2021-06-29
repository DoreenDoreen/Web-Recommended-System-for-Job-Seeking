package com.laioffer.job.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class ExtractRequestBody {

    public List<String> data;

    @JsonProperty("max_keywords")   // mapping with JSON input format
    public int maxKeywords;

    public ExtractRequestBody(List<String> data, int maxKeywords) {  // we need to create instance for later use, not for JSON
        this.data = data;
        this.maxKeywords = maxKeywords;
    }

}
