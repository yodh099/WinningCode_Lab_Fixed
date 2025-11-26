export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    content: string; // HTML content
    author: string;
    date: string;
    readTime: string;
    category: string;
    image: string;
}

export const blogPosts: BlogPost[] = [
    {
        id: '1',
        slug: 'avni-ai-nan-biznis',
        title: 'Avni AI nan Biznis',
        subtitle: 'Kijan entèlijans atifisyèl ap chanje endistri yo.',
        author: 'Jean-Pierre Michel',
        date: '2025-05-15',
        readTime: '5 min',
        category: 'Teknoloji',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2832&auto=format&fit=crop',
        content: `
      <p class="lead">Entèlijans Atifisyèl (AI) pa jis yon mo alamòd ankò; se yon fòs transfòmasyon k ap redefini fason biznis yo opere, pran desizyon, ak sèvi kliyan yo. Soti nan ti antrepriz rive nan gwo kòporasyon, AI ap vin tounen yon zouti endispansab pou rete konpetitif nan mache mondyal la.</p>

      <h2>Revolisyon Endistriyèl Dijital la</h2>
      <p>Nou ap viv nan yon epòk kote done se nouvo lò a. Men, done san analiz pa gen valè. Se la AI antre nan jwèt la. Li pèmèt konpayi yo analize gwo kantite enfòmasyon nan yon fraksyon segonn, dekouvri modèl kache, ak fè prediksyon egzat.</p>
      
      <h3>Otomatizasyon Entelijan</h3>
      <p>Youn nan pi gwo avantaj AI se otomatizasyon. Pa sèlman otomatizasyon travay repetitif, men otomatizasyon kognitif. Chatbots entelijan, asistan vityèl, ak sistèm repons otomatik pèmèt biznis yo ofri sipò kliyan 24/7 san yo pa ogmante depans operasyonèl yo drastikman.</p>
      <ul>
        <li><strong>Sipò Kliyan:</strong> Chatbots ki konprann langaj natirèl.</li>
        <li><strong>Jesyon Chèn Pwovizyon:</strong> Prediksyon demann pou evite rupture stock.</li>
        <li><strong>Resous Imèn:</strong> Triye CV ak idantifye pi bon kandida yo otomatikman.</li>
      </ul>

      <h2>Pèsonalizasyon nan yon Nivo Siperyè</h2>
      <p>Kliyan jodi a atann eksperyans pèsonalize. AI pèmèt mak yo konprann preferans endividyèl chak kliyan. Netflix ak Amazon se premye egzanp, men menm ti boutik sou entènèt kapab kounye a itilize zouti AI pou rekòmande pwodwi ki baze sou istolik acha ak konpòtman navigasyon.</p>

      <blockquote>"AI pa la pou ranplase moun, men pou pèmèt moun fè travay ki gen plis valè ak plis kreyativite."</blockquote>

      <h2>Defi ak Etik</h2>
      <p>Malgre tout avantaj sa yo, adopsyon AI vini ak defi. Sekirite done, vi prive, ak patipri nan algoritm yo se sijè ki bezwen atansyon serye. Li enpòtan pou biznis yo adopte AI yon fason responsab, asire ke teknoloji a sèvi tout moun san diskriminasyon.</p>

      <h2>Konklizyon</h2>
      <p>Avni biznis se nan kolaborasyon ant moun ak machin. Konpayi ki anbrase AI jodi a ap bati fondasyon pou siksè demen. Li lè pou nou sispann wè AI kòm yon menas epi kòmanse wè li kòm patnè estratejik ki pi pwisan nou an.</p>
    `
    },
    {
        id: '2',
        slug: 'teknoloji-aksesib-pou-tout-moun',
        title: 'Teknoloji Aksesib pou Tout Moun',
        subtitle: 'Poukisa aksè dijital se yon nesesite moral.',
        author: 'Sarah Etienne',
        date: '2025-06-02',
        readTime: '7 min',
        category: 'Sosyete',
        image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2938&auto=format&fit=crop',
        content: `
      <p class="lead">Nan mond konekte jodi a, aksè a teknoloji pa ta dwe yon privilèj, men yon dwa fondamantal. "Aksesiblite" pa vle di sèlman disponiblite entènèt, men tou konsepsyon zouti ki ka itilize pa tout moun, kèlkeswa kapasite fizik oswa mantal yo.</p>

      <h2>Kisa Aksesiblite Dijital Ye?</h2>
      <p>Aksesiblite dijital (Web Accessibility) se pratik pou asire ke sit entènèt, aplikasyon, ak zouti dijital yo fèt pou tout moun ka navige, konprann, ak entèraksyon avèk yo. Sa gen ladan moun ki gen andikap vizyèl, oditif, motè, oswa kognitif.</p>

      <h3>Poukisa li Enpòtan?</h3>
      <p>Plis pase 1 milya moun nan mond lan ap viv ak yon fòm andikap. Lè nou inyore aksesiblite, nou ekskli yon gwo pati nan popilasyon an. Sa pa sèlman yon pèt ekonomik pou biznis yo, men se yon echèk moral pou sosyete a.</p>

      <h2>Prensip Konsepsyon Inivèsèl</h2>
      <p>Konsepsyon pou tout moun (Universal Design) benefisye tout moun. Pa egzanp, soutit nan videyo yo esansyèl pou moun ki soud, men yo itil tou pou moun k ap gade videyo nan yon anviwònman ki fè bwi oswa ki pa vle deranje lòt moun.</p>
      <ul>
        <li><strong>Kontras Koulè:</strong> Asire tèks lizib pou moun ki gen pwoblèm vizyon.</li>
        <li><strong>Navigasyon Klavye:</strong> Sit la dwe fonksyonèl san sourit.</li>
        <li><strong>Tèks Altènatif (Alt Text):</strong> Deskripsyon imaj pou lektè ekran yo.</li>
      </ul>

      <h2>Teknoloji kòm Zouti Egalite</h2>
      <p>Teknoloji gen pouvwa pou nivelman teren an. Aplikasyon ki li tèks pou avèg, zouti ki tradwi langaj siy an tan reyèl, ak lojisyèl ki pèmèt kontwòl òdinatè ak je se jis kòmansman an. Lè nou demokratize aksè a zouti sa yo, nou louvri pòt pou edikasyon, travay, ak endepandans pou milyon moun.</p>

      <h2>Wòl Devlopè ak Kreyatè yo</h2>
      <p>Kòm kreyatè teknoloji, nou gen responsablite pou nou pa kite pèsonn dèyè. Chak liy kòd, chak chwa koulè, ak chak estrikti paj konte. Ann bati yon entènèt ki vrèman ouvè pou tout moun.</p>
    `
    },
    {
        id: '3',
        slug: 'senplisite-nan-konsepsyon',
        title: 'Senplisite nan Konsepsyon',
        subtitle: 'Lè ou retire sa ki pa nesesè pou montre sa ki esansyèl.',
        author: 'Marc-Henry Louis',
        date: '2025-06-20',
        readTime: '4 min',
        category: 'Design',
        image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2874&auto=format&fit=crop',
        content: `
      <p class="lead">"Less is more." Sa a se pa jis yon fraz popilè, se fondasyon an nan bon konsepsyon modèn. Nan yon mond ki chaje ak bri ak distraksyon, senplisite se kle pou kaptive atansyon ak kominike efikasman.</p>

      <h2>Poukisa Konplike Lè Ou Ka Senp?</h2>
      <p>Konsepsyon konplèks souvan kache yon mank de klète nan panse. Lè ou fòse tèt ou senplifye, ou fòse tèt ou konprann vrè sans pwoblèm w ap rezoud la. Senplisite mande kouraj—kouraj pou retire, pou di non, ak pou konsantre sou sa ki vrèman enpòtan.</p>

      <h3>Minimalis vs. Fonksyonalis</h3>
      <p>Senplisite pa vle di vid. Li vle di entansyonèl. Chak eleman sou yon paj dwe gen yon rezon pou l la. Si li pa ede itilizatè a atenn objektif li, li se yon distraksyon.</p>
      <ul>
        <li><strong>Espas Blan (White Space):</strong> Li bay je a repo epi li mete aksan sou kontni an.</li>
        <li><strong>Tipografi Klè:</strong> Chwazi polis ki fasil pou li epi ki gen pèsonalite.</li>
        <li><strong>Koulè Estratejik:</strong> Itilize koulè pou gide atansyon, pa pou dekore sèlman.</li>
      </ul>

      <h2>Eksperyans Itilizatè (UX) San Friksyon</h2>
      <p>Yon konsepsyon senp se yon konsepsyon entwisitif. Itilizatè a pa ta dwe janm mande tèt li "kisa pou m fè kounye a?". Bouton yo dwe vizib, tèks yo dwe klè, ak chemen an dwe dwat. Lè nou retire friksyon, nou ogmante satisfaksyon ak konvèsyon.</p>

      <blockquote>"Pèfeksyon atenn pa lè pa gen anyen ankò pou ajoute, men lè pa gen anyen ankò pou retire." — Antoine de Saint-Exupéry</blockquote>

      <h2>Konklizyon</h2>
      <p>Senplisite se fòm final sofistikasyon an. Nan pwochen pwojè ou a, mande tèt ou: "Èske sa nesesè?" Si repons lan se non, retire li. Rezilta a pral yon pwodwi ki pi pwòp, pi rapid, ak pi agreyab pou tout moun.</p>
    `
    }
];
