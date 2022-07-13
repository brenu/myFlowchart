import {validator} from '@ioc:Adonis/Core/Validator'

validator.rule('usernameValidation', (value, _, options) => {
  if(typeof value !== 'string')
    return;

  for(let i=0; i<value.length; ++i){
    let validChar = ((value[i] >= 'a' && value[i] <= 'z') || value[i] == '_' || (value[i] >= '0' && value[i] <= '9') || (value[i] >= 'A' && value[i] <= 'Z'));
    if(!validChar){
      options.errorReporter.report(
        options.pointer,
        'usernameValidation',
        "username~O nome de usuário deve conter apenas letras, dígitos ou underline",
        options.arrayExpressionPointer
      )
    }
  }
})
