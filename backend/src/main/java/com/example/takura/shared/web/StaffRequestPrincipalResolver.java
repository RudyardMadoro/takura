package com.example.takura.identity.infrastructure;
import com.example.takura.identity.controller.StaffRequestPrincipal;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
@Component
public class StaffRequestPrincipalResolver implements HandlerMethodArgumentResolver {
    public boolean supportsParameter(MethodParameter parameter) { return parameter.hasParameterAnnotation(StaffRequestPrincipal.class); }
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer container, NativeWebRequest request,
            WebDataBinderFactory binderFactory) { return request.getAttribute(StaffSessionFilter.PRINCIPAL_ATTRIBUTE, NativeWebRequest.SCOPE_REQUEST); }
}
