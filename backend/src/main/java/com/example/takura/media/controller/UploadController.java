package com.example.takura.media.controller;

import com.example.takura.identity.controller.StaffRequestPrincipal;
import com.example.takura.identity.domain.StaffPrincipal;
import com.example.takura.media.application.UploadService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class UploadController {
    private final UploadService uploads;
    UploadController(UploadService uploads) { this.uploads = uploads; }

    @PostMapping("/upload-sessions")
    ResponseEntity<?> create(@RequestBody UploadService.CreateSession request, HttpServletRequest servletRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(uploads.createCustomer(request, servletRequest.getRemoteAddr()));
    }

    @PostMapping("/upload-sessions/{session}/files/{attachment}/renew")
    Object renew(@PathVariable UUID session,@PathVariable UUID attachment,@RequestHeader("X-Upload-Capability") String capability) {
        return uploads.renew(session, attachment, capability);
    }

    @PostMapping("/upload-sessions/{session}/files/{attachment}/complete")
    Object complete(@PathVariable UUID session,@PathVariable UUID attachment,@RequestHeader("X-Upload-Capability") String capability) {
        return uploads.complete(session, attachment, capability);
    }

    @PostMapping("/admin/media/upload-sessions")
    ResponseEntity<?> createStaff(@StaffRequestPrincipal StaffPrincipal actor,@RequestBody UploadService.CreateSession request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(uploads.createStaff(actor, request));
    }

    @PostMapping("/admin/quote-upload-sessions")
    ResponseEntity<?> createQuotePdf(@StaffRequestPrincipal StaffPrincipal actor,@RequestBody UploadService.CreateSession request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(uploads.createQuotePdf(actor, request));
    }

    @GetMapping("/admin/enquiries/{enquiry}/attachments")
    Object list(@StaffRequestPrincipal StaffPrincipal actor,@PathVariable UUID enquiry) {
        return uploads.enquiryAttachments(actor, enquiry);
    }

    @GetMapping("/admin/attachments/{attachment}/download")
    ResponseEntity<Void> download(@StaffRequestPrincipal StaffPrincipal actor,@PathVariable UUID attachment) {
        return ResponseEntity.status(HttpStatus.SEE_OTHER).location(uploads.staffDownload(actor, attachment)).build();
    }
}
