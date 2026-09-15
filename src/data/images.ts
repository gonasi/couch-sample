// Free Unsplash stock photography used as stand-ins for GH2 product shots.
// Every id below was verified to return HTTP 200 from images.unsplash.com.
const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

export const sized = (url: string, w: number) =>
  url.replace(/([?&])w=\d+/, `$1w=${w}`);

export const IMG = {
  // sofas & living rooms
  greySectional: u("1616486338812-3dadae4b4ace"),
  whiteLiving: u("1631679706909-1844bbd07221"),
  sunnyLiving: u("1600210492486-724fe5c67fb0"),
  whiteGreySofa: u("1583847268964-b28dc8f51f92"),
  greyMinimal: u("1491926626787-62db157af940"),
  beigeSectional: u("1560448204-e02f11c3d0e2"),
  blackSofa: u("1513694203232-719a280e022f"),
  greyLiving: u("1600121848594-d8644e57abab"),
  whiteSofaLiving: u("1505691938895-1758d7feb511"),
  wideLiving: u("1618221195710-dd6b41faaea6"),
  whiteSofaRoom: u("1616137466211-f939a420be84"),
  darkSectional: u("1550581190-9c1c48d21d6c"),
  beigeSofa: u("1512212621149-107ffe572d2f"),
  greyLivingSofa: u("1493663284031-b7e3aefcae8e"),
  blueSofa: u("1484101403633-562f891dc89a"),
  bohoLiving: u("1502672260266-1c1ef2d93688"),
  orangeChairLiving: u("1618220179428-22790b461013"),
  pinkRugLiving: u("1617103996702-96ff29b1c467"),
  brightInterior: u("1493809842364-78817add7ffb"),
  livingCorner: u("1567767292278-a4f21aa2d36e"),
  // details
  cushion: u("1611967164521-abae8fba4668"),
  pillowsBench: u("1579656381226-5fc0f0100c3b"),
  fabricMacro: u("1573065370788-db1a2dbb098d"),
  coffeeTable: u("1633505899118-4ca6bd143043"),
  tools: u("1558618666-fcd25c85cd64"),
  // pets / lifestyle
  dogs: u("1548199973-03cce0bbc87b"),
  dogInBox: u("1520038410233-7141be7e6f97"),
  beagle: u("1543466835-00a7907e9de1"),
};

export const HOME_IMAGES = {
  hero: IMG.wideLiving,
  lastCouch: IMG.sunnyLiving,
  pitPromo: IMG.darkSectional,
  feelComfort: IMG.brightInterior,
  features: {
    washable: IMG.pillowsBench,
    cushion: IMG.cushion,
    boxes: IMG.dogInBox,
    connector: IMG.tools,
    ottoman: IMG.coffeeTable,
  } as Record<string, string>,
};

export const UGC = [
  {
    image: IMG.beagle,
    handle: "@barkandbrew",
    caption: "Official nap inspector",
    product: "5-piece-cloud",
  },
  {
    image: IMG.orangeChairLiving,
    handle: "@theloftlist",
    caption: "Sunday reset complete",
    product: "4-piece-pit-cloud",
  },
  {
    image: IMG.dogs,
    handle: "@twocorgis",
    caption: "They claimed the corner",
    product: "6-piece-corner-pit-cloud",
  },
  {
    image: IMG.blueSofa,
    handle: "@nest.at.nine",
    caption: "Swapped the covers for spring",
    product: "5-piece-cloud",
  },
  {
    image: IMG.pinkRugLiving,
    handle: "@homewithjules",
    caption: "Pit mode: activated",
    product: "6-piece-pit-cloud",
  },
  {
    image: IMG.bohoLiving,
    handle: "@smallspace.big",
    caption: "Fits our 600 sq ft",
    product: "4-piece-pit-cloud",
  },
];

export const REVIEW_PHOTOS = [
  IMG.whiteGreySofa,
  IMG.pillowsBench,
  IMG.beagle,
  IMG.bohoLiving,
  IMG.dogs,
];
