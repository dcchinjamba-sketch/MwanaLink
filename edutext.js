/* Health education text. Each language is a list of 8 ["title","text"] pairs, in the same order as English.
   Set a language to null until a verified translation exists (English is shown with a notice).
   Languages listed in "draft" show a "not yet verified" notice. Remove a language from "draft" once it has been checked. */
window.MWL_EDU={
order:["en","bm","kq","to","ln","lv","lz","ny"],
names:{en:"English",bm:"Bemba (Ichibemba)",kq:"Kaonde (Chikaonde)",to:"Tonga (Chitonga)",ln:"Lunda (Chilunda)",lv:"Luvale (Chiluvale)",lz:"Lozi (Silozi)",ny:"Nyanja (Chinyanja)"},
draft:["bm","to","lz","ny"],
t:{
en:[
["Breast milk only","Give only breast milk for the first 6 months. It feeds your baby and fights illness."],
["Good food from 6 months","From 6 months, add soft, mixed foods several times a day. Keep breastfeeding until 2 years."],
["Vaccines save lives","Vaccines protect your child from dangerous diseases. Take your child for every vaccine on time and bring the Under-Five card."],
["Wash your hands","Wash your hands with soap and clean water after using the toilet and before cooking or feeding your child."],
["Clean water, ORS for diarrhoea","Give your child clean boiled water. If your child has diarrhoea, give ORS, keep feeding, and go to the clinic if it does not stop."],
["Sleep under a net","Sleep under a treated mosquito net every night. If your child has a fever, go to the clinic quickly."],
["Monthly growth check","Take your child to the clinic every month to be weighed. Ask about vitamin A and deworming."],
["Danger signs: go now","Go to the clinic at once if your child cannot drink, vomits everything, has fits, or is very weak or sleepy."]],
ny:[
["Mkaka wa pa bele wokha","Patsani mwana mkaka wa pa bele wokha pa miyezi 6 yoyamba. Umamudyetsa ndi kumuteteza ku matenda."],
["Chakudya chabwino kuyambira miyezi 6","Kuyambira miyezi 6, onjezerani zakudya zofewa zosiyanasiyana kangapo pa tsiku. Pitirizani kuyamwitsa mpaka zaka 2."],
["Katemera amapulumutsa miyoyo","Katemera amateteza mwana wanu ku matenda oopsa. Mutengere mwana wanu kukalandira katemera aliyense pa nthawi yake ndipo mubwere ndi khadi la Under-Five."],
["Sambani m'manja","Sambani m'manja ndi sopo ndi madzi aukhondo mukatuluka kuchimbudzi komanso musanaphike kapena kudyetsa mwana wanu."],
["Madzi aukhondo, ORS akatsekula m'mimba","Patsani mwana madzi aukhondo owiritsa. Mwana akatsekula m'mimba, mum'patse ORS, pitirizani kum'dyetsa, ndipo pitani kuchipatala ngati sakuleka."],
["Gonani mu neti","Gonani mu neti ya udzudzu yothira mankhwala usiku uliwonse. Mwana akakhala ndi malungo, pitani kuchipatala msanga."],
["Kuyeza mwana mwezi uliwonse","Bweretsani mwana wanu kuchipatala mwezi uliwonse kuti akayezedwe. Funsani za vitamini A ndi mankhwala a mphutsi."],
["Zizindikiro zoopsa: pitani tsopano","Pitani kuchipatala nthawi yomweyo ngati mwana sangathe kumwa, akusanza chilichonse, akukomoka, kapena ndi wofooka kapena wogona kwambiri."]],
bm:[
["Amabele fye","Mupe umwana amabele fye pa myeshi 6 iya kubalilapo. Amabele yalamulisha kabili yalamucingilila ku malwele."],
["Ifyakulya ifisuma ukufuma pa myeshi 6","Ukufuma pa myeshi 6, mupeko umwana ifyakulya ifisuma ifya musango na musango imiku iingi pa bushiku. Mwamyeko amabele ukufika pa myaka 2."],
["Imiti ya kucingilila (vaccines)","Imiti ya kucingilila ilacingilila umwana ku malwele yabipa. Mutwale umwana ku vaccine yonse pa nshita yayo kabili mwise ne Under-Five card."],
["Sambeni amaboko","Sambeni amaboko na sopo ne menshi ayasuma pa numa ya kuya ku cimbusu na pa ntanshi ya kuteka ifyakulya nelyo ukulisha umwana."],
["Amenshi yabilwa ne ORS","Mupe umwana amenshi yabilwa. Nga umwana ali na diarrhoea, mupe ORS, mukonkeleshe ukumulisha, kabili mutwale ku kiliniki nga taleka."],
["Lalani mu net ya mbu","Lalani mu net ya mbu (treated) ubushiku bonse. Umwana nga ali na malungo, mutwale ku kiliniki bwangu."],
["Ukupima umwana cila mweshi","Mutwale umwana ku kiliniki cila mweshi ukuti bamupime. Mwipushe pa vitamin A ne deworming."],
["Ingozi: mutwale umwana bwangu","Mutwale umwana ku kiliniki bwangu nga tanwa, nga alasanta (vomiting) fyonse, nga ali na fits, nelyo nga alefooka sana (very weak)."]],
to:[
["Mabeele buyo","Amupe mwana mabeele buyo kwamyezi iili 6 yakusaanguna. Mabeele alamulisya mwana alimwi alamukwabilila kuzilwazi."],
["Zyakulya zibotu kuzwa kumyezi iili 6","Kuzwa kumyezi iili 6, amupe mwana zyakulya zibotu zyakusiyana-siyana ziindi zinji mubuzuba. Muzumanane kumuyamwisya kusikila kumyaka iili 2."],
["Vaccine ilakwabilila mwana","Vaccine ilakwabilila mwana kuzilwazi zibyaabi. Mutwale mwana kuvaccine yoonse ciindi cakwe alimwi mukalete kkadi lya Under-Five."],
["Samba maanza","Samba maanza aasopo amaanzi mabotu mukamana kubelesya toilet alimwi kumbele lyakuteka naa kulisya mwana."],
["Maanzi mabotu, ORS","Amupe mwana maanzi mabotu aabilisidwe. Naa mwana ulijisi diarrhoea, amupe ORS, muzumanane kumulisya, alimwi mutwale kucipatala naa taleki."],
["Mulale mu neti","Mulale mu neti ya mosquito (treated) kubusiku boonse. Naa mwana ulijisi malaria naa fever, mutwale kucipatala lino."],
["Kupima mwana mwezi uuli woonse","Mutwale mwana kucipatala mwezi uuli woonse kuti apimwe. Mubuzye kujatikizya vitamin A alimwi deworming."],
["Ngozi: mutwale mwana lino","Mutwale mwana kucipatala lino naa tanywi, naa ulaluka zyoonse (vomiting), naa ulijisi fits, naa uli kulaazya kapati (very weak)."]],
lz:[
["Mashi a mabele fela","Mu fe mwana mashi a mabele fela ka likweli ze 6 za pili. A mu fepa, ni ku mu sireleza kwa bokuli."],
["Lico ze nde ku zwa kwa likweli ze 6","Ku zwa kwa likweli ze 6, mu fe mwana lico ze nde ze fapahane, nako ze ñata ka lizazi. Mu twelele ku mu yamusa ku isa ku lilimo ze 2."],
["Vaccine i sireleza mwana","Vaccine i sireleza mwana kwa bokuli bo bu kozi. Mu isee mwana kwa vaccine kaufela ka nako, mi mu tise khadi ya Under-Five."],
["Mu kape matasi","Mu kape matasi ka sopo ni mezi a kenile ha mu bile mwa toilet, ni pili ha mu pheha kamba ku fepa mwana."],
["Mezi a kenile ni ORS","Mu fe mwana mezi a kenile a belezwi. Haiba mwana a na ni diarrhoea, mu mu fe ORS, mu twelele ku mu fepa, mi mu mu isee kwa kiliniki haiba i sa ime."],
["Mu robale mwa neti","Mu robale mwa neti ya mosquito (treated) busihu kaufela. Haiba mwana a na ni malaria, mu mu isee kwa kiliniki ka potlako."],
["Ku lema mwana kweli ni kweli","Mu isee mwana kwa kiliniki kweli ni kweli ku ka lemiwa. Mu botise ka vitamin A ni deworming."],
["Kotsi: mu ye kwa kiliniki","Mu ye kwa kiliniki ka potlako haiba mwana a sa koni ku nwa, a hlanya (vomiting) kaufela, a na ni fits, kamba a lobala hahulu (very weak or sleepy)."]],
kq:null,ln:null,lv:null
}};
