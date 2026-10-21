package com.example.takura.quotations.controller;

import com.example.takura.identity.controller.StaffRequestPrincipal;
import com.example.takura.identity.domain.StaffPrincipal;
import com.example.takura.quotations.application.QuoteService;
import com.example.takura.quotations.application.QuoteService.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1")
public class QuoteController {
    private final QuoteService quotes;
    public QuoteController(QuoteService quotes){this.quotes=quotes;}

    @GetMapping("/admin/enquiries/{enquiry}/quote-revisions") Object list(@StaffRequestPrincipal StaffPrincipal actor,@PathVariable UUID enquiry){return quotes.list(actor,enquiry);}
    @PostMapping("/admin/enquiries/{enquiry}/quote-revisions") ResponseEntity<?> create(@StaffRequestPrincipal StaffPrincipal actor,@PathVariable UUID enquiry,@RequestBody CreateDraft body){var result=quotes.create(actor,enquiry,body);return ResponseEntity.status(201).eTag(q(result.revision())).body(result);}
    @GetMapping("/admin/quote-revisions/{id}") ResponseEntity<?> get(@StaffRequestPrincipal StaffPrincipal actor,@PathVariable UUID id){var result=quotes.get(actor,id);return ResponseEntity.ok().eTag(q(result.revision())).body(result);}
    @PutMapping("/admin/quote-revisions/{id}") ResponseEntity<?> edit(@StaffRequestPrincipal StaffPrincipal actor,@PathVariable UUID id,@RequestHeader(value="If-Match",required=false)String match,@RequestBody CreateDraft body){var result=quotes.edit(actor,id,pre(match),body);return ResponseEntity.ok().eTag(q(result.revision())).body(result);}
    @PostMapping("/admin/quote-revisions/{id}/submit-approval") ResponseEntity<?> submit(@StaffRequestPrincipal StaffPrincipal actor,@PathVariable UUID id,@RequestHeader(value="If-Match",required=false)String match){var result=quotes.submit(actor,id,pre(match));return ResponseEntity.ok().eTag(q(result.revision())).body(result);}
    @PostMapping("/admin/quote-revisions/{id}/approve") ResponseEntity<?> approve(@StaffRequestPrincipal StaffPrincipal actor,@PathVariable UUID id,@RequestHeader(value="If-Match",required=false)String match){var result=quotes.approve(actor,id,pre(match));return ResponseEntity.ok().eTag(q(result.revision())).body(result);}
    @PostMapping("/admin/quote-revisions/{id}/send") ResponseEntity<?> issue(@StaffRequestPrincipal StaffPrincipal actor,@PathVariable UUID id,@RequestHeader(value="If-Match",required=false)String match,@RequestHeader(value="Idempotency-Key",required=false)String key){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(quotes.issue(actor,id,pre(match),key));}
    @PostMapping("/admin/quote-revisions/{id}/dispatch") ResponseEntity<Void> dispatch(@StaffRequestPrincipal StaffPrincipal actor,@PathVariable UUID id,@RequestBody Dispatch body){quotes.dispatch(actor,id,body.evidenceReference(),body.manual());return ResponseEntity.noContent().build();}
    @PostMapping("/admin/quote-revisions/{id}/revoke") ResponseEntity<Void> revoke(@StaffRequestPrincipal StaffPrincipal actor,@PathVariable UUID id,@RequestBody Map<String,String> body){quotes.revoke(actor,id,body.get("reason"));return ResponseEntity.noContent().build();}
    @PostMapping("/admin/quote-revisions/{id}/cancel") ResponseEntity<?> cancel(@StaffRequestPrincipal StaffPrincipal actor,@PathVariable UUID id,@RequestHeader(value="If-Match",required=false)String match,@RequestBody Map<String,String> body){var result=quotes.cancel(actor,id,pre(match),body.get("reason"));return ResponseEntity.ok().eTag(q(result.revision())).body(result);}
    @PostMapping("/admin/quote-revisions/{id}/outcomes") ResponseEntity<Void> outcome(@StaffRequestPrincipal StaffPrincipal actor,@PathVariable UUID id,@RequestBody Outcome body){quotes.outcome(actor,id,body);return ResponseEntity.status(201).build();}

    @PostMapping("/quote-access/exchange") ResponseEntity<?> exchange(@RequestBody Map<String,String> body,HttpServletRequest request){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).header("Referrer-Policy","no-referrer").body(quotes.exchange(body.get("token"),request.getRemoteAddr()));}
    @GetMapping("/customer/quote") ResponseEntity<?> customer(@RequestHeader(value="X-Quote-Session",required=false)String session){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).header("X-Robots-Tag","noindex, nofollow, noarchive").header("Referrer-Policy","no-referrer").body(quotes.customer(session));}
    @GetMapping("/customer/quote/document") ResponseEntity<byte[]> document(@RequestHeader(value="X-Quote-Session",required=false)String session){var doc=quotes.document(session);return ResponseEntity.ok().cacheControl(CacheControl.noStore()).header("X-Robots-Tag","noindex, nofollow, noarchive").header("Referrer-Policy","no-referrer").header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\""+doc.filename()+"\"").contentType(MediaType.APPLICATION_PDF).contentLength(doc.bytes().length).body(doc.bytes());}

    private static String q(long revision){return "\""+revision+"\"";}private static long pre(String value){if(value==null)throw new ResponseStatusException(HttpStatus.PRECONDITION_REQUIRED,"If-Match is required");try{return Long.parseLong(value.replace("\"",""));}catch(NumberFormatException e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"If-Match is invalid");}}
    public record Dispatch(String evidenceReference,boolean manual){}
}
