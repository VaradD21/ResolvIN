package com.resolvedesk.service;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "resolvedesk")
public record ClassifierProperties(
    List<String> escalationKeywords
) {}
