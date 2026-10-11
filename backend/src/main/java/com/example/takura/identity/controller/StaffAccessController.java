package com.example.takura.identity.controller;
import com.example.takura.identity.application.StaffAccessService;
import com.example.takura.identity.application.StaffAccessService.StaffUpdate;
import com.example.takura.identity.domain.StaffPrincipal;
import java.util.List; import java.util.UUID;
import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/admin/users")
class StaffAccessController {
 private final StaffAccessService service; StaffAccessController(StaffAccessService service){this.service=service;}
 @GetMapping List<?> list(@StaffRequestPrincipal StaffPrincipal actor){return service.list(actor);}
 @PostMapping ResponseEntity<?> create(@StaffRequestPrincipal StaffPrincipal actor,@RequestBody StaffUpdate request){var v=service.provision(actor,request);return ResponseEntity.status(201).eTag('"'+Long.toString(v.revision())+'"').body(v);}
 @PutMapping("/{id}") ResponseEntity<?> update(@StaffRequestPrincipal StaffPrincipal actor,@PathVariable UUID id,@RequestHeader(value="If-Match",required=false) String match,@RequestBody StaffUpdate request){if(match==null) return ResponseEntity.status(428).build(); long revision=Long.parseLong(match.replace("\"",""));var v=service.update(actor,id,revision,request);return ResponseEntity.ok().eTag('"'+Long.toString(v.revision())+'"').body(v);}
}
