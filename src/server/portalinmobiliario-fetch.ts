interface SellerAddress {
  id: number;
  comment: string;
  address_line: string;
  country: {
    id: string;
    name: string;
  };
  state: {
    id: string;
    name: string;
  };
  city: {
    id: string;
    name: string;
  };
}

interface SellerInfo {
  id: number;
  car_dealer: boolean;
  real_estate_agency: boolean;
  tags: string[];
  address: SellerAddress;
  car_dealer_logo: string;
  real_estate_agency_fantasy_name?: string;
  official_store_id?: string;
  official_store_name?: string;
  official_store_text?: string;
  official_store_verbose_text?: string;
}

interface Picture {
  retina: string;
  tags: {
    heigth: number;
    width: number;
    alt: string;
  };
}

interface Pictures {
  stack: Picture;
  grid: Picture;
  mosaic: Picture;
}

interface Price {
  amount: number;
  currency_id: string;
  discount_rate: number;
  billing: boolean;
}

interface OfficialStore {
  text: {
    text: string;
    color: string;
  };
  verbose_text: {
    text: string;
    color: string;
  };
  permalink: string;
  tracks: {
    melidata_track: {
      path: string;
      type: string;
      event_data: {
        official_store_id: string;
      };
    };
    analytics_track: {
      action: string;
      category: string;
      label: string;
    };
  };
  has_official_store_icon: boolean;
}

interface Media {
  id: string;
  label: {
    text: string;
    color: string;
  };
  type: string;
  icon: {
    id: string;
  };
  background: string;
}

interface Result {
  id: string;
  bookmarked: boolean;
  descriptions: {
    label: string;
  }[];
  seller_info: SellerInfo;
  permalink: string;
  pictures: Pictures;
  price: Price;
  title: string;
  subtitles: {
    item_title: string;
    operation: string;
  };
  vertical: string;
  location: string;
  is_ad: boolean;
  official_store?: OfficialStore;
  tags: object[];
  image_ratio: string;
  category_id: string;
  sub_title: string;
  is_development: boolean;
  rebates: object[];
  media?: Media;
  available_quantity: number;
  latitude: number;
  longitude: number;
  pills: object[];
  is_multifamily: boolean;
  pictures_qty: number;
}

interface Response {
  results: Result[];
  // Add other properties from the JSON data as needed
}

async function customFetch(params: string): Promise<Result[]> {
  try {
    const finalUrl = `https://www.portalinmobiliario.com/api/${params}`;

    const options: RequestInit = {
      // cache: "no-store",
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9,es;q=0.8",
        "device-memory": "8",
        downlink: "10",
        dpr: "2",
        ect: "4g",
        encoding: "UTF-8",
        priority: "u=1, i",
        referer: finalUrl,
        rtt: "50",
        "sec-ch-ua":
          '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "viewport-width": "1728",
        "x-requested-with": "XMLHttpRequest",
      },
    };
    const response = await fetch(finalUrl, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonResponse = (await response.json()) as Response;
    return jsonResponse.results;
  } catch (error: unknown) {
    return Promise.reject(`Fetch error: ${(error as Error).message}`);
  }
}

export default customFetch;
