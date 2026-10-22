package com.example.takura.communications.application;
import com.fasterxml.jackson.databind.JsonNode;
public interface SnsSignatureVerifier { boolean verify(JsonNode envelope); }
