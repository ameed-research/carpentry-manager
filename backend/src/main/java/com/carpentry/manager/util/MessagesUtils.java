package com.carpentry.manager.util;

import lombok.AllArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class MessagesUtils {

    public static final Object[] EMPTY_ARGS = new Object[0];
    private final MessageSource messageSource;

    public String getMessage(String code) {
        return getMessage(code, EMPTY_ARGS);
    }

    public String getMessage(String code, Object... args) {
        return getMessage(code, null, args);
    }

    public String getMessage(String code, String defaultMessage, Object... args) {
        return messageSource.getMessage(code, args, defaultMessage, LocaleContextHolder.getLocale());
    }
}
