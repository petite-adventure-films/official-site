import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import router from 'JS/router/pafshop.js'

import axios  from 'axios'
Vue.prototype.$http = axios

Vue.use(Vuex)

const store = new Vuex.Store({

      plugins: [createPersistedState()]

    , state:
    {
          products: []
        , baskets: []
        , basketsCount: 0
        , paymentCompleted: false
        , orderID: ''
        , user:{
              name: ''
            , zipcode: ''
            , prefecture: ''
            , city: ''
            , address1: ''
            , tel: ''
            , email: ''
            , emailConfirm: ''
            , receipt: false
            , receiptName: ''
            , receiptDescription: ''
            , agree: false
        }
    }
    
    , getters:
    {
    
        convertYen: () => number =>
        {
            return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(number);
        }
        
        , itemsInBasket: (state) =>
        {
            let arr = [];
            state.baskets.forEach(a => {
                let arr2 = {};
                arr2.info = state.products.find(a2 => a2.id == a.id);
                arr2.basket = a;
                arr.push(arr2);
            })
            return arr;
        }
        
        , totalAmount: (state, getters) =>
        {
            let sum1 = 0;
            let items = getters.itemsInBasket;
            items.forEach(a => {
                let sum2 = 0;
                a.basket.unit.forEach((v, k) => {
                    sum2 = sum2 + v * parseInt(a.info.price_contents[k])
                })
                sum1 = sum1 + sum2;
            })
            return sum1;
        }
        
        , deliveryFee: (state, getters) =>
        {    
            return (getters.totalAmount >= 3000) ? 0 : 300;
        }
        
    }
    
    , mutations:
    {
        
        init: (state) =>
        {
            state.products = [];
            state.baskets = [];
            state.basketsCount = 0;
            state.paymentCompleted = false;
            state.orderID = '';
            state.user = {
                  name: ''
                , zipcode: ''
                , prefecture: ''
                , city: ''
                , address1: ''
                , tel: ''
                , email: ''
                , emailConfirm: ''
                , receipt: false
                , receiptName: ''
                , receiptDescription: ''
                , agree: false
            }; 
        }
        
        , setOrderID: (state, payload) =>
        {
            state.orderID = payload
        }
        
        , setUser: (state, payload) =>
        {
            state.user[payload.key] = payload.value;
        }
        
        , setPaymentCompleted: (state, payload) =>
        {
            state.paymentCompleted = payload
        }
        
        , setProducts: (state, payload) =>
        {
            
            state.products = payload.products.data.map(a => {
                
                let filmdata = payload.films.data.filter(a2 => a.filmtags.indexOf(a2.filmtags[0]) > -1 );
                
                return {
                      id              : a.id
                    , title           : a.title.rendered
                    , link            : a.link
                    , filmData        : filmdata.reverse()
                    , intro           : a.custom_fields.intro
                    , catch           : a.custom_fields.catch
                    , contents        : a.custom_fields.contents
                    , no_specials     : a.custom_fields.no_specials
                    , disc_indexs     : a.custom_fields.disc_indexs
                    , disc_numbers    : a.custom_fields.disc_numbers
                    , disc_types      : a.custom_fields.disc_types
                    , disc_contents   : a.custom_fields.disc_contents
                    , price_indexs    : a.custom_fields.price_indexs
                    , price_contents  : a.custom_fields.price_contents
                    , type_indexs     : a.custom_fields.type_indexs
                    , type_contents   : a.custom_fields.type_contents
                }
                
            });
            
        }
        
        , setBasket: (state, payload) => 
        {
            state.baskets.push(payload);
        }
        
        , updateBasket: (state, payload) =>
        {
            let index = state.baskets.findIndex(a => a.id == payload.id);
            
            let c = 0;
            state.baskets[index]['unit'].forEach(v => c = v + c);
            
            if(c == 0)
            {
                state.baskets.splice(index, 1);
                return false;
            }
            
            Vue.set(state.baskets, index, payload);
        }
        
        , updateBasketCount: (state) =>
        {
            let c = 0;
            state.baskets.forEach(a => {
                a.unit.forEach(v => c = v + c);
            })
            state.basketsCount = c;
        }
        
    }
    
    , actions:
    {
        
        async getPafshopData({commit})
        {
        
            const shopURI = `${process.env.SITE_URL}wp-json/wp/v2/pafshop`;
            const filmURI = `${process.env.SITE_URL}wp-json/wp/v2/films`;
            
            const response = await Promise.all([
                  axios.get(shopURI)
                , axios.get(filmURI)
            ]).then(([products, films]) => {
                commit('setProducts', { products, films });
            })
            
        }
        
        , setOrderID: ({commit}) =>
        {
            const orderID = `O${new Date().getFullYear()}JP-${Math.floor(Date.now() / 1000)}`;
            commit('setOrderID', orderID);
        }

        
        , async complete({ state, getters, commit }, payload)
        {
            
            let params = state.user;
            
            let arr = [];
            // params.order
            getters.itemsInBasket.forEach(a => {
                
                a.basket.unit.forEach((a2, k2) => {
                    if(a2 > 0)
                    {
                        let type = (a.basket.type[k2] == 2) ? 'ブルーレイ' : 'DVD';
                        arr.push(`${a.info.title}(${type}) 【${a.info.price_indexs[k2]}】 : ${a2}`)
                    }
                })
                
            })
            
            params.order = arr;
            
            params.orderID = state.orderID;
            params.subtotal = getters.convertYen(getters.totalAmount);
            params.deliveryFee = getters.convertYen(getters.deliveryFee);
            params.total = getters.convertYen(getters.totalAmount + getters.deliveryFee);
            params.paymentMethod = payload.paymentMethod;
            
            if(state.user.receipt == true)
            {
                params.receiptName = state.user.receiptName ? state.user.receiptName : '(記載なし)'
                params.receiptDescription = state.user.receiptDescription ? state.user.receiptDescription : '(記載なし)'
            }
            else
            {
                delete params.receiptName
                delete params.receiptDescription
            }
            
            let url = `${process.env.SITE_URL}cashier`;
            let res = await axios.post(url, params)
            if(res){
                if(res.status === 200)
                {
                    router.push({ name: 'thanks', params: 
                        {
                              orderID: state.orderID
                            , paymentMethod: payload.paymentMethod
                        }
                    })
                }
            }
        
        }
        
    }
    
})
export default store