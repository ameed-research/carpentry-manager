package com.carpentry.manager.category.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "categories")
@Getter
@Setter
@Builder
public class Category {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

}
