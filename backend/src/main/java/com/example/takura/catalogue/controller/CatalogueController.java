package com.example.takura.catalogue.controller;
import com.example.takura.catalogue.application.CatalogueService;
import com.example.takura.catalogue.application.CatalogueService.WriteVariant;
import com.example.takura.identity.controller.StaffRequestPrincipal;
import com.example.takura.identity.domain.StaffPrincipal;
import java.net.URI;import java.time.Duration;import java.util.UUID;
import org.springframework.http.*;import org.springframework.web.bind.annotation.*;import org.springframework.web.server.ResponseStatusException;
@RestController @RequestMapping("/api/v1")
public class CatalogueController {
 private final CatalogueService service; CatalogueController(CatalogueService service){this.service=service;}
 @GetMapping("/catalogue/boards") ResponseEntity<?> boards(@RequestParam(required=false)String type,@RequestParam(required=false)String finish,@RequestParam(required=false)String thickness,@RequestParam(required=false,name="sheet_size")String size,@RequestParam(required=false)UUID cursor,@RequestParam(defaultValue="12",name="page_size")int pageSize){return ResponseEntity.ok().cacheControl(CacheControl.maxAge(Duration.ofSeconds(60)).cachePublic()).body(service.products(type,finish,thickness,size,cursor,pageSize));}
 @GetMapping("/catalogue/boards/{slug}") ResponseEntity<?> board(@PathVariable String slug){var value=service.product(slug);return ResponseEntity.ok().cacheControl(CacheControl.maxAge(Duration.ofSeconds(60)).cachePublic()).body(value);}
 @GetMapping("/catalogue/hardware") ResponseEntity<?> hardware(){return ResponseEntity.ok().cacheControl(CacheControl.maxAge(Duration.ofSeconds(60)).cachePublic()).body(service.hardware());}
 @GetMapping("/admin/catalogue/variants") Object admin(@StaffRequestPrincipal StaffPrincipal p){return service.admin(p);}
 @PostMapping("/admin/catalogue/variants") ResponseEntity<?> create(@StaffRequestPrincipal StaffPrincipal p,@RequestBody WriteVariant r){var created=service.create(p,r);return ResponseEntity.created(URI.create("/api/v1/admin/catalogue/variants/"+created.id())).eTag(q(created.revision())).body(created);}
 @PutMapping("/admin/catalogue/variants/{id}") ResponseEntity<Void> update(@StaffRequestPrincipal StaffPrincipal p,@PathVariable UUID id,@RequestHeader(value="If-Match",required=false)String match,@RequestBody WriteVariant r){long next=service.update(p,id,pre(match),r);return ResponseEntity.noContent().eTag(q(next)).build();}
 @DeleteMapping("/admin/catalogue/variants/{id}") ResponseEntity<Void> archive(@StaffRequestPrincipal StaffPrincipal p,@PathVariable UUID id,@RequestHeader(value="If-Match",required=false)String match){long next=service.archive(p,id,pre(match));return ResponseEntity.noContent().eTag(q(next)).build();}
 private static long pre(String s){if(s==null)throw new ResponseStatusException(HttpStatus.PRECONDITION_REQUIRED,"If-Match is required");try{return Long.parseLong(s.replace("\"",""));}catch(NumberFormatException e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"If-Match is invalid");}}
 private static String q(long n){return "\""+n+"\"";}
}
