package com.carpentry.manager.supplier.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "suppliers")
@Getter
@Setter
@Builder
public class Supplier {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String phone;

    private String taxId; // H.P. / T.Z.

    private String contactPerson;

    private String contactPhone;

    private String email;

}
