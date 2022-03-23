import { FormControl, ValidationErrors } from "@angular/forms";

export class EcommerceValidators {
    // whitespace validation
    static notOnlyWhitespace(control: FormControl): ValidationErrors{

        // check if the string has only whitespaces
        if((control.value != null) &&(control.value.trim().length === 0)){

            // invalid: return error message
            return{'notOnlyWhitespace': true};
        }
        else{
            // valid: return null
            return null;
        }

        
    }
}
