package com.example.takura.enquiries.controller;
import com.example.takura.enquiries.application.EnquiryService;import com.example.takura.enquiries.application.EnquiryService.Request;
import com.example.takura.identity.controller.StaffRequestPrincipal;import com.example.takura.identity.domain.StaffPrincipal;import jakarta.servlet.http.HttpServletRequest;import java.util.UUID;
import org.springframework.http.*;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1") public class EnquiryController{
 private final EnquiryService service;EnquiryController(EnquiryService service){this.service=service;}
 @PostMapping("/enquiries") ResponseEntity<?> create(@RequestHeader(value="Idempotency-Key",required=false)String key,@RequestHeader(value="X-Correlation-ID",required=false)String correlation,@RequestBody Request body,HttpServletRequest request){String c=correlation==null||correlation.isBlank()?UUID.randomUUID().toString():correlation;return ResponseEntity.status(HttpStatus.CREATED).header("X-Correlation-ID",c).body(service.create(key,body,request.getRemoteAddr(),c));}
 @GetMapping("/admin/enquiries") Object list(@StaffRequestPrincipal StaffPrincipal p,@RequestParam(required=false)String state,@RequestParam(required=false)UUID cursor,@RequestParam(defaultValue="25",name="page_size")int size){return service.list(p,state,cursor,size);}
 @GetMapping("/admin/enquiries/count") Object count(@StaffRequestPrincipal StaffPrincipal p,@RequestParam(required=false)String state){return java.util.Map.of("count",service.count(p,state));}
 @GetMapping("/admin/enquiries/{id}") Object detail(@StaffRequestPrincipal StaffPrincipal p,@PathVariable UUID id){return service.detail(p,id);}
}
