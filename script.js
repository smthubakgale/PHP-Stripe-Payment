const public_key = "pk_test_51LnlKAIKaQvzpZSsvxc79TB4v3KnhQ2R9UFh5J7umorTQ8S5xacCbHXjQAbXzKwJjK4SaMhBniSJmIlfS6MemuAO003WtRAQ4u";
const stripe = Stripe(public_key );
const cardnum = document.querySelector('#cardnum')
const cardexp = document.querySelector('#cardexp')
const cardcvc = document.querySelector('#cardcvc')
const btn = document.querySelector('button')
const sts = document.querySelector('.status')

const mystyle={
    base:{iconColor:'rgb(128, 128, 255)',
    color:'rgb(128, 128, 255)',
    fontFamily:'sans-serif',
    '::placeholder': { color:'#757593'}
    },
    complete:{ color:'green'}
}

const elements = stripe.elements()

const numElm = elements.create('cardNumber',{showIcon:true,iconStyle:'solid', style:mystyle})
numElm.mount(cardnum)
    
const expElm = elements.create('cardExpiry', {disabled:true, style:mystyle})
expElm.mount(cardexp)

const cvcElm = elements.create('cardCvc', {disabled:true, style:mystyle})
cvcElm.mount(cardcvc)

numElm.on('change', (e) =>{
    if(e.complete){
        expElm.update({disabled:false})
        expElm.focus()
    }
})

expElm.on('change', (e) =>{
    if(e.complete){
        cvcElm.update({disabled:false})
        cvcElm.focus()
    }
})

cvcElm.on('change', (e) =>{
    if(e.complete){
       btn.disabled = false 
    }
})

function pay()
{    
      $.post( "http://localhost:8002/index.php",
      { amount:3000 , description:"food products"} , function(data) 
      { 
          var client_secret = data.client_secret;   

           stripe.confirmCardPayment(client_secret,
           {
                  payment_method: 
                  {
                      card: numElm,
                      billing_details: 
                      {
                          name: $("#fname").val() + " " + $("#fname").val() ,
                          email: $("#eml").val() ,
                          address: 
                          {
                            city: $("#cty").val(),
                            country: $("#cntry").val(),
                            line1: $("#add1").val(),
                            line2: $("#add2").val(),
                            postal_code: $("#pcode").val(), 
                          },
                          phone: $("#phone").val()
                      },
                  },
              })
              .then(function(result) 
              {
                  if (result.error)
                   {
                      sts.innerHTML = `
                      <strong>Error:  </string> ${result.error.message}
                      `
                  } else 
                  {
                      // Handle next step based on PaymentIntent's status.
                      sts.innerHTML = `
                      <h3>${result.paymentIntent.description}</h3>
                      <strong>Transction Id: </strong>${result.paymentIntent.id}<br>
                      <strong>Amount deducted: </strong> ${result.paymentIntent.amount/100} ${result.paymentIntent.currency}
                       ` 
                  }
                  sts.style.display='block'
              });
      }) 
      .fail(function(err) 
      {
          alert( "fail : " + JSON.stringify(err) );
      }); 
}

btn.addEventListener('click', ()=>
{
    return;
    alert("a");

    fetch('http://localhost:8002/index.php', 
    {
        method:'POST', 
        headers:{'Content-Type': 'application/json'},
        body:{}
    })
    .then(res=>res.json())
    .then(payload => {
        stripe.confirmCardPayment(payload.client_secret, {
            payment_method:{card:numElm}
        }).then(transStat => {
            if(transStat.error){
                sts.innerHTML = `
                <strong>Error:  </string> ${transStat.error.message}
                `
            }
            else{
                sts.innerHTML = `
               <h3>${transStat.paymentIntent.description}</h3>
               <strong>Transction Id: </strong>${transStat.paymentIntent.id}<br>
               <strong>Amount deducted: </strong> ${transStat.paymentIntent.amount/100} ${transStat.paymentIntent.currency}
                `
            }
        })
    })
})


