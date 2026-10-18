package com.example.takura.shared.web;
import com.example.takura.enquiries.application.EnquiryService.DomainException;import com.example.takura.enquiries.application.EnquiryService.FieldDomainException;import com.example.takura.media.application.UploadService.UploadException;import jakarta.servlet.http.HttpServletRequest;import java.util.List;import java.util.UUID;
import org.springframework.http.*;import org.springframework.web.bind.annotation.*;
@RestControllerAdvice public class DomainErrorHandler{
 @ExceptionHandler(DomainException.class) ResponseEntity<ErrorBody> domain(DomainException e,HttpServletRequest r){String c=(String)r.getAttribute("correlationId");if(c==null)c=UUID.randomUUID().toString();var fields=e instanceof FieldDomainException f?f.errors:List.of();return ResponseEntity.status(e.status).body(new ErrorBody(e.code,e.getMessage(),c,fields));}
 @ExceptionHandler(UploadException.class) ResponseEntity<ErrorBody> upload(UploadException e,HttpServletRequest r){String c=(String)r.getAttribute("correlationId");if(c==null)c=UUID.randomUUID().toString();return ResponseEntity.status(e.status).body(new ErrorBody(e.code,e.getMessage(),c,List.of()));}
 record ErrorBody(String code,String message,String correlationId,List<?> fieldErrors){}
}
