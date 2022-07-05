"use strict"

//////////////////////////   SETTINGS   //////////////////////

let ulrAPI_productos = "https://60c4b786ec8ef800175e060e.mockapi.io/getgloby";
let mail_to = "tomas.cogliatti@gmail.com";

//////////////////////////     Menu     ////////////////////////////////

let boxBody = document.querySelector("#idBody");
let precioSubtotTemp = 0;
let esValidoSubtot = false;
let item = 0;
let costoFinal = 0;
let verifLog = false;
let entroPorCompras = false;
let productosDB;
let _globalBTN;
let btnSalirMenu = document.querySelector("#salirMenu");
btnSalirMenu.addEventListener("click", () =>{
    cambiarEstadoMenuDesplegable()
})

let cuerpo = document.querySelector(".cuerpo");
let botonesNav = document.querySelectorAll("#btn-nav");
let menuBtn = document.querySelector("#menu");
menuBtn.addEventListener("click",cambiarEstadoMenuDesplegable);
let boxNav = document.querySelector(".boxNav");

function cambiarEstadoMenuDesplegable(){  // Movil
    let estadoMenuBton = (window.getComputedStyle(menuBtn)).getPropertyValue("display");
    if( estadoMenuBton == "block"){
        boxNav.classList.toggle("esconder");
    }
}
function cambioEstiloBotonesNav(btn){
    for (let i=0; i<botonesNav.length; i++){
        botonesNav[i].classList.remove("liNavSelSeleccionado");
        botonesNav[i].classList.add("liNavSel");
    }
    botonesNav[btn].classList.remove("liNavSel");
    botonesNav[btn].classList.add("liNavSelSeleccionado");
}


//////////////////////////////////////////////////////////////////////////////////////////////////
///////                  Partial Render secciones de pagina general                    ///////////
//////////////////////////////////////////////////////////////////////////////////////////////////

let ulr_secciones = ["home.html",
"compras.html",
"contactenos.html",
"administrador.html",
"adminProd.html"];

for(let i=0;i<botonesNav.length;i++){ // se crea un evento de escucha para cada boton de menu
    botonesNav[i].addEventListener("click", function(){router(i)});
}

function router(btn){
    _globalBTN=btn;
    // cambio estilo botones de navegación
    if(btn!=4){
        cambioEstiloBotonesNav(btn);
    } else{
        cambiarEstadoMenuDesplegable();
    }
    cambiarEstadoMenuDesplegable();
    fetch(ulr_secciones[btn]).then(promesa => {
        if(promesa.ok)
        promesa.text().then(html =>{
                cuerpo.innerHTML=html;
                switch (btn){
                    case 0: incializarHome();
                            break;
                    case 1: buscarInfoJson(ulrAPI_productos);
                            break;
                    case 2: incializarContactenos();
                            break;
                    case 3: inicializarAdministrador();
                            break;
                    case 4: inicializarAdminProd();
                        break;
                    }
                    });
                    else
                    trow("error");
                }).catch( error =>{
                    cuerpo.innerHTML=`<p>No se pudo cargar la pagina ${ulr_secciones[btn]}</p>`;
                });
            }



//////////////////////////////////     HOME     /////////////////////////////////////////////////////////////////


function incializarHome(){
    console.log("Home cargada");
}

//////////////////////////////////      COMPRAS     /////////////////////////////////////////////////////////////////

let precioUnitario_temp;
let subTotal_temp;
let unidSubtotal_temp;
let listaDeCompra;
let finalCost;
let datosDeCompra;
let selectorProducto;
let valorPrecioUnitario;
let boxUnidades;
let precioSubtotal;
let btnAgregarAcarrito;
let btnVaciarCarrito;
let tablaItemsCarrito;
let boxUnidadesFinal;
let boxCostoFinal;
let finalizarCompra;
let botonesControlUnid;
let mejeError1;
let boxImagCompras;
let selectProducto;

function incializarCompras(){
    let productos = productosDB;
    finalCost = document.querySelector("#finalCost");
    boxImagCompras = document.querySelector("#boxImagCompras");
    selectorProducto = document.querySelector("#selectorProducto");
    selectorProducto.innerHTML = '<option value="producto" disabled selected>Producto</option>';
    let index = 0;
    productos.forEach(producto => {
        let select = `<option value="${index}">${producto.nombre}</option>`;
        selectorProducto.innerHTML += select;
        index ++;
    });

    precioUnitario_temp = 0;
    subTotal_temp = 0;
    unidSubtotal_temp = 0;
    entroPorCompras = true;
    listaDeCompra = [];

    valorPrecioUnitario = document.querySelector("#valorPrecioUnitario");
    // muestra precio unitario del articulo seleccionado con una funsion anonima
    selectorProducto.addEventListener("change",function(){
        let poduct = productos[selectorProducto.value]
        let url_img = poduct.foto;
        boxImagCompras.src = url_img;
        boxUnidades.innerHTML="1";
        precioUnitario_temp = productos[(selectorProducto.value)].precio;
        valorPrecioUnitario.innerHTML= precioUnitario_temp;
        precioSubtotTemp = precioUnitario_temp;
        precioSubtotal.innerHTML= precioSubtotTemp;
    });
    boxUnidades = document.querySelector("#boxUnit");
    precioSubtotal = document.querySelector("#precioSubtotal");
    // calcula el precio subtotal del articulo seleccionado segun el precio y cantidad
    btnAgregarAcarrito = document.querySelector("#btnAgregarAcarrito");
    btnAgregarAcarrito.addEventListener("click",function(){agregarProducto()});

    btnVaciarCarrito = document.querySelector("#btnVaciarCarrito");
    /* Mostrar los productos en tabla de carrito de compras web */
    tablaItemsCarrito = document.querySelector("#tablaItemsCarrito");
    boxUnidadesFinal = document.querySelector("#boxUnidFinal");
    boxCostoFinal = document.querySelector("#boxCostoFinal");
    finalizarCompra = document.querySelector("#finalizarCompra");
    finalizarCompra.addEventListener("click",finalizarCompraFuncion);
    /*******   funsion para seleccionar cantidad  *******/
    botonesControlUnid = document.querySelectorAll(".cambioUnits");
    botonesControlUnid[0].addEventListener("click",function(){seleccionarUnidProducto(0)});
    botonesControlUnid[1].addEventListener("click",function(){seleccionarUnidProducto(1)});
    mejeError1 = document.querySelector("#mejeError1")
}
function manipularMejeError1(visible, mensaje){
    if (visible){
        mejeError1.classList.remove("esconder");
        mejeError1.classList.add("estiloError");
        mejeError1.innerHTML=mensaje;
    } else {
        mejeError1.classList.remove("estiloError");
        mejeError1.classList.add("esconder");
    }
}
// Botones de Compra desde el home///
function compraHome(opcion){
    if (!verifLog)
        logueo();
    else
        verificacionCaptcha();
}

// agregar productos a carrito de compra (responde a btnAgregarAcarrito)
function agregarProducto(){
    let productos = productosDB;
    let unidades_temp = parseInt(boxUnidades.innerHTML);
    subTotal_temp = unidades_temp * precioUnitario_temp;
    if(selectorProducto.value!="producto" && !(boxUnidades.innerHTML=="" || boxUnidades.innerHTML==0)){
        listaDeCompra.push({
                producto: productos[(selectorProducto.value)].nombre,
                precioUnit: precioUnitario_temp,
                unidades: unidades_temp,
                subtotal: subTotal_temp,
        });
        blanquearDatosProductos();
        tablaCarrito();
    }
}

function blanquearDatosProductos(){
    boxImagCompras.src = "./images/img_select_prod.png";
    selectorProducto.value="producto";
    boxUnidades.innerHTML="1";
    precioSubtotal.innerHTML="-.-";
    valorPrecioUnitario.innerHTML="-.-";
    finalCost.innerHTML = "$ -.-";
}
function vaciarCarrito(){
    listaDeCompra = [];
    tablaCarrito();
    blanquearDatosProductos();
}
function borrarArticuloCarrito(posicion){
    listaDeCompra.splice(posicion,1);
    tablaCarrito();
}
function tablaCarrito(){
    boxUnidadesFinal.innerHTML=``;
    boxCostoFinal.innerHTML=``;
    tablaItemsCarrito.innerHTML=``;
    let unid_total=0;
    let costo_total=0;
    for (let i=0; i<listaDeCompra.length; i++ ){
        tablaItemsCarrito.innerHTML+=`
        <tr >
        <td class="columna">${i+1}</td>
        <td class="columna">${listaDeCompra[i].producto}</td>
        <td class="columna">x${listaDeCompra[i].unidades}</td>
        <td class="columnaL">$${listaDeCompra[i].precioUnit}</td>
        <td class="columna">$${listaDeCompra[i].subtotal}</td>
        <td class="columnaS"> <img src="images/delProducto.png" alt="" class="iconEliminarPod" onclick="borrarArticuloCarrito(${i})" ></td>
        </tr>`;
        unid_total+=parseInt(listaDeCompra[i].unidades);
        costo_total+=listaDeCompra[i].subtotal;
    }
    boxUnidadesFinal.innerHTML=`x${unid_total}`;
    boxCostoFinal.innerHTML =`$${costo_total}`;
    finalCost.innerHTML = `$${costo_total}`;

}

function finalizarCompraFuncion(){
    if(listaDeCompra.length!=0){
        cambiarEstadoMenuDesplegable();
        router(0);
    }
}

function seleccionarUnidProducto(opcion){
    if(selectorProducto.value=="producto")
        return;
    if (opcion==0){
        if (boxUnidades.innerHTML>1 && boxUnidades.innerHTML!=""){
            boxUnidades.innerHTML= parseFloat(boxUnidades.innerHTML) - 1;
            modificarSubtotal();
        }
    } else
    if (boxUnidades.innerHTML==""){
        boxUnidades.innerHTML = 1;
        modificarSubtotal();
    }
    else{
        boxUnidades.innerHTML = parseFloat(boxUnidades.innerHTML) + 1;
        modificarSubtotal();
    }
}
function modificarSubtotal(){
    subTotal_temp = boxUnidades.innerHTML * precioUnitario_temp;
    precioSubtotal.innerHTML = subTotal_temp;
}

//////////////////////////////////      CONTACTENOS     /////////////////////////////////////////////////////////////////

let mejeErrorEnviarMensaje;
let nombre_local;
let mail_local;
let mensaje_local;
let mejeEnviadoCorrectamente ;
let idBoxMensaje;
let enviarCaptcha;
let captchaIn;
let mejeErrorCaptcha;
let captchaValues;
let captchaImg;
let captchaGlobal;
let formulario;

function incializarContactenos(){
    let address = "https://formsubmit.co/"+mail_to ;
    captchaGlobal = 1;
    captchaValues = ["to be or not to be","qgphjd","recaptcha","pnrhxr","captcha"];
    captchaImg = document.querySelector("#captchaImg");

    randomCaptcha();
    formulario = document.querySelector("#formulario");
    formulario.setAttribute("action", address);
    formulario.addEventListener("submit", (evento)=>{
        evento.preventDefault();

        mejeErrorEnviarMensaje = document.querySelector("#mejeErrorEnviarMensaje");
        nombre_local=document.querySelector("#nombreMensaje");
        mail_local=document.querySelector("#emailMensaje");
        mensaje_local=document.querySelector("#textoMensaje");
        mejeEnviadoCorrectamente = document.querySelector("#mejeEnviadoCorrectamente");
        idBoxMensaje = document.querySelector("#idBoxMensaje");

        captchaIn = document.querySelector("#captchaIn");
        mejeErrorCaptcha = document.querySelector("#mejeErrorCaptcha");

        if(submitMensaje() & submitCaptcha()){
            formulario.submit();
        }
    });
}

/**** boton enviar mensaje */
function submitCaptcha(){
        if (verificacionCaptcha()){
            return true
        }else{
            randomCaptcha();
            return false;
        }
    }
function submitMensaje(){
    if (nombre_local.value==""||mail_local.value==""||mensaje_local.value==""){
        mejeErrorEnviarMensaje.classList.add("estiloError");
        mejeErrorEnviarMensaje.classList.remove("esconder2");
        return false;
    } else {
        mejeErrorEnviarMensaje.classList.add("esconder2");
        mejeErrorEnviarMensaje.classList.remove("estiloError");
        return true;
    }
}
function randomCaptcha(){
    captchaGlobal = Math.floor(Math.random() *5 +1)
    captchaImg.src=`images/captcha${captchaGlobal}.jpg`;
}
function mostrarErrorCaptcha(mensaje){
    mensajeErrorCaptcha(true, "Captcha incorrecto")
    randomCaptcha();
}
function verificacionCaptcha(){
    let verifCaptcha=false;
    if(captchaIn.value==""){
        mensajeErrorCaptcha(true, "Debe resolver el captcha antes de enviar");
        randomCaptcha();
    } else if (captchaValues[captchaGlobal-1]==captchaIn.value.toLowerCase() || captchaIn.value.toLowerCase() =="a")
        verifCaptcha=true;
    else{
        mensajeErrorCaptcha(true,"Captcha incorrecto");
        captchaIn.value ="";
        randomCaptcha();
        }
    return verifCaptcha;
 }
 function mensajeErrorCaptcha(visible, mensaje){
    if (visible){
        mejeErrorCaptcha.classList.remove("esconderMensaje");
        mejeErrorCaptcha.classList.add("estiloError");
        mejeErrorCaptcha.innerHTML=mensaje;
    } else {
        mejeErrorCaptcha.classList.remove("estiloError");
        mejeErrorCaptcha.classList.add("esconderMensaje");
    }
}

//////////////////////////////////      ADMINISTRADOR     /////////////////////////////////////////////////////////////////

let mejeErrorAdmin;
let boxRespuesta;
let btn_refrescarLista;
let btn_agregarProducto;
let jsonAPI;

function inicializarAdministrador(){
    mejeErrorAdmin = document.querySelector("#mejeErrorAdmin");
    boxRespuesta = document.querySelector("#respuesta");
    boxRespuesta.innerHTML=`<p class="cargando">Cargando...</p>`;
    btn_refrescarLista = document.querySelector("#refrescarLista");
    btn_agregarProducto = document.querySelector("#agregarProducto");
    btn_agregarProducto.addEventListener("click", () => {
        entrada = ["alta",{nombre:"",tipo:"",precio:"",foto:""}];
        router(4)
    });
    btn_refrescarLista.addEventListener("click",()=>{
        inicializarAdministrador()
    });
    
    buscarInfoJson(ulrAPI_productos);
}

// traer arreglo json desde la API /////////////////////
function buscarInfoJson(url){
    console.log(_globalBTN);
    fetch (url).then(r => {
        return r.json();
    }).then(items => {
        productosDB = JSON.parse(JSON.stringify(items));
        jsonAPI=JSON.parse(JSON.stringify(items));
        if(_globalBTN==1)
            incializarCompras()
        else if (_globalBTN==3)
            mostrarItemsNombre(items);
    }).catch(items => {
        console.log("Error: no se completo la operación");
    })
}

// filtrar y mostrar los items  ////////////////////////
function mostrarItemsNombre(data){
    let json_temp =  data; // copia del arreglo original
    boxRespuesta.innerHTML="";
   
    for(let i=0;i<json_temp.length;i++){
        // crear elementos de tabla
        let tr = document.createElement('tr');
        let td_nombre = document.createElement('td');
        let td_precio = document.createElement('td');
        let td_accion = document.createElement('td');
        // creacion de botones de accion
        let btn_borrar = document.createElement('img');
        let btn_editar = document.createElement('img');
        btn_editar.src="images/editProducto.png";
        btn_borrar.src="images/delProducto.png";
        btn_editar.classList="accionesAdmin";
        btn_borrar.classList="accionesAdmin";
        // agregar contenido a los elementos
        td_nombre.innerHTML=`${json_temp[i].nombre}`;
        td_precio.innerHTML=`$ ${json_temp[i].precio}`;
        td_accion.appendChild(btn_borrar);
        td_accion.appendChild(btn_editar);
        // crear fila
        tr.appendChild(td_nombre);
        tr.appendChild(td_precio);
        tr.appendChild(td_accion);
        // agregar a la tabla
        boxRespuesta.appendChild(tr);

// agregando funciones a los botones elimniar y editar

        btn_borrar.addEventListener("click",()=>{
            borrarProducto(json_temp[i]);
        });
        btn_editar.addEventListener("click",()=>{
            entrada = ["editar",i]
            router(4)
        });
        
    }
}

//////////////////////////////////      ADMIN PRODUCTOS ABM  /////////////////////////////////////////////////////////////////

let enviar_adminProd;
let formulario_adminProd;
let return_adminProd;

let formato = {tipo:"",nombre:"",precio:"",foto:""};
let entrada = ["",""];

let error_adminProd;
let tipo_adminProd;
let precio_adminProd;
let url_adminProd;
let form_adminProd;
let producto_adminProd;

function inicializarAdminProd(){
    return_adminProd = document.querySelector("#return_adminProd");
    return_adminProd.addEventListener("click", (evento)=>{ 
        evento.preventDefault();
        cambiarEstadoMenuDesplegable();
        router(3);});
    form_adminProd = document.forms["form_adminProd"];
    formulario_adminProd = document.querySelector("#formulario_adminProd");
    enviar_adminProd = document.querySelector("#enviar_adminProd");
    error_adminProd = document.querySelector("#error_adminProd");
    tipo_adminProd=document.querySelector("#tipo_adminProd");
    precio_adminProd=document.querySelector("#precio_adminProd");
    url_adminProd=document.querySelector("#url_adminProd");
    producto_adminProd=document.querySelector("#producto_adminProd");

    switch (entrada[0]) {
        case "alta":
            altaProd();
            break;
        case "ver":
            verForm(entrada[1]);
            break;
        case "editar":
            editProd(entrada[1])
            break;
        default:
                break;
    }
}
        
// Alta Producto ////////////
function altaProd() {
    formulario_adminProd.addEventListener("submit", (evento) => {
        let data = formato;
        data.nombre = producto_adminProd.value;
        data.tipo = tipo_adminProd.value;
        data.precio = parseInt(precio_adminProd.value);
        data.foto = url_adminProd.value;
        evento.preventDefault();
        if (submitAdminProd()) {
            agregarProductoJson(data);
            cambiarEstadoMenuDesplegable();
            router(3);
                }
        });
    
}
function submitAdminProd(){
    if( error_adminProd.value =="" || tipo_adminProd.value=="" ||
        precio_adminProd.value==""|| url_adminProd.value==""){

        showError_prodAdmin(true);
        return false;
    } else {
        showError_prodAdmin(false);
        return true;
    }

}
async function agregarProductoJson(data){
    try{
        let respuesta = await fetch(ulrAPI_productos, {
            "method" : "POST",
            "headers": {"Content-Type":"application/json"},
            "body": JSON.stringify(data)
        });
        if(respuesta.ok){
            buscarInfoJson(ulrAPI_productos);
            console.log("subido correctamente");

        }else{
            console.log("error al subir");
        }
    }catch{
        console.log("error al subir catch");
    }
}
function showError_prodAdmin(arg){
    if (arg) {
        error_adminProd.classList.add("estiloError");
        error_adminProd.classList.remove("esconder2");
    }else{
        error_adminProd.classList.add("esconder2");
        error_adminProd.classList.remove("estiloError");
    }
}
// editar producto ///////////////////
function editProd(data){
    data = productosDB[entrada[1]];
    producto_adminProd.value = data.nombre;
    tipo_adminProd.value = data.tipo;
    precio_adminProd.value = data.precio; 
    url_adminProd.value = data.foto;
    formulario_adminProd.addEventListener("submit", (evento)=>{
        evento.preventDefault();
        if(submitAdminProd()){
            data = {
                tipo: tipo_adminProd.value,
                nombre: producto_adminProd.value,
                precio: precio_adminProd.value,
                foto: url_adminProd.value
            }
            editarProducto(data, productosDB[entrada[1]].id);
            cambiarEstadoMenuDesplegable();
            router(3);
        }
    });
}

async function borrarProducto(item) {
        let resp = await fetch(`${ulrAPI_productos}/${item.id}`, {
            "method": "DELETE"
        });
        if (resp.ok) {
            buscarInfoJson(ulrAPI_productos);
            _globalBTN=3;
            console.log("ELIMINADO CON EXITO");
            cambiarEstadoMenuDesplegable();
            router(3);
        }else{
            console.log("Error al eliminar producto");
        }
        
}
// editar producto ////////////////////
async function editarProducto(data, id){
 try {
     let resp = await fetch(`${ulrAPI_productos}/${id}`, {
         "method": "PUT",
         "headers": { "Content-type": "application/json" },
         "body": JSON.stringify(data)
     });
     if (resp.ok) {
         buscarInfoJson(ulrAPI_productos);
         console.log("Editado con exito");
     }else{
         console.log("error al modificar")
     }
 } catch (error) {
     console.log("error al modificar")
 }
}

///////////////////////// carga inicial
router(0);
