import requests
import os
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm

# Base URL
BASE_URL = "https://storage.googleapis.com/minioms-saas-increff-com/rms-templates/"

# Template names
template_names = [
    "stock-transfer.fo.vm",
    "invoice.fo.vm",
    "credit-note-template.fo.vm",
    "libas-custom-invoice-template-3.fo.vm",
    "gerua-invoice.fo.vm",
    "uspl-einvoice-template.fo.vm",
    "e-invoice-template2.fo.vm",
    "femella-invoice-template5.fo.vm",
    "magento-invoice.fo.vm",
    "repro-invoice-template.fo.vm",
    "miniklub-invoice.fo.vm",
    "timex-invoice.fo.vm",
    "tgm-invoice-template9.fo.vm",
    "nykaa_invoice_template.fo.vm",
    "chicco_invoice.fo.vm",
    "vd_invoice_template5.fo.vm",
    "nf_delivery_challan.fo.vm",
    "hummel_invoice.fo.vm",
    "bb_standard_template.fo.vm",
    "pc_invoice.fo.vm",
    "sfcc-6.fo.vm",
    "nykaa_invoice.fo.vm",
    "nykaa_gloot_invoice.fo.vm",
    "nykaa_kicka_invoice.fo.vm",
    "cred_invoice_template.fo.vm",
    "new_kapsons_invoice-6.fo.vm",
    "miniklub_packbox_template.fo.vm",
    "folkulture_invoice.fo.vm",
    "pristyn_invoice.fo.vm",
    "libas-international-usd-invoice-gst-12_3.fo.vm",
    "damensch-pack-box-label.fo.vm",
    "damensch-packslip.fo.vm",
    "damensch-invoice-template-4.fo.vm",
    "damensch-einvoice2.fo.vm",
    "celio_packbox.fo.vm",
    "baccarose-invoice.fo.vm",
    "damensch-master-packslip.fo.vm",
    "damensch-box-packslip.fo.vm",
    "standard-master-label.fo.vm",
    "koski-invoice-template.fo.vm",
    "pristyn_4by6_invoice.fo.vm",
    "bk_box_label_template.fo.vm",
    "damensch-master-label-with-barcode-1.fo.vm",
    "damensch-box-label-all-size.fo.vm",
    "uspl-dummy-shipping-label.fo.vm",
    "airloom-invoice-template.fo.vm",
    "crocs_invoice_template.fo.vm",
    "levis_invoice_template.fo.vm",
    "damensch-export-invoice.fo.vm",
    "shaktibrandz-invoice.fo.vm",
    "xstep_packbox_template.fo.vm",
    "tigc-b2b-invoice.fo.vm",
    "styleverse-einvoice-template.fo.vm",
    "standard_invoice.fo.vm",
    "damensch-bettercommerce-invoice1.fo.vm",
    "xstep_master_label_template.fo.vm",
    "bb_custom_template_3.fo.vm",
    "indianterrain_invoice_template1.fo.vm",
    "ekhi_invoice.fo.vm",
    "meesho_standard_invoice.fo.vm",
    "birkenstock_invoice_template-1.fo.vm",
    "apparel_group_invoice-1.fo.vm",
    "ludic-invoice.fo.vm",
    "arabic_invoice.fo.vm",
    "bergamo_invoice.fo.vm",
    "shiseido-invoice.fo.vm",
    "damensch-quickcommerce-invoice.fo.vm",
    "xtep-invoice.fo.vm",
    "libas-e-invoice-template.fo.vm",
    "cred_invoice_template.fo.vm",
    "apparel_group_AGSM_UAE_invoice.fo.vm",
    "apparel_group_AGSM-KSA_invoice.fo.vm",
    "nvidia_invoice_template-2.fo.vm",
    "mdx-invoice-template-5.fo.vm",
    "heydude-invoice-template.fo.vm",
    "damensch-einvoice-size-template.fo.vm",
    "uspl-wrong-invoice.fo.vm",
    "pant_project_invoice-1.fo.vm",
    "uspl-stamp-einvoice-template.fo.vm",
    "noon_standard_invoice.fo.vm",
    "kapsons_custom_invoice-1.fo.vm",
    "apparel_group_MIRAQUE_KSA_invoice.fo.vm",
    "fknits-noon-invoice.fo.vm",
    "uspl-einvoice-gurgaon-with-stamp.fo.vm",
    "apparel_group_ck_trendyol_ksa_invoice.fo.vm",
    "apparel_group_th_trendyol_ksa_invoice.fo.vm",
    "noon_shipping_label_template.fo.vm",
    "invoice_with_shipping_cod_charge.fo.vm",
    "aramya_invoice.fo.vm",
    "rf_oppdoor_invoice_template.fo.vm",
    "standard-invoice-with-shipping-charge.fo.vm",
    "rms-b2b-box-label-with-sku-details.fo.vm",
    "akg-b2b-invoice.fo.vm",
    "oto_standard_box_label.fo.vm",
    "oto_box_label.fo.vm",
    "oto_box_label_b2c.fo.vm"
]

# Make sure templates directory exists
os.makedirs("templates", exist_ok=True)

def download_template(template_name):
    """Download a single template"""
    url = BASE_URL + template_name
    response = requests.get(url)
    
    if response.status_code == 200:
        with open(os.path.join("templates", template_name), "wb") as f:
            f.write(response.content)
        return True
    else:
        return False

# Download templates using ThreadPoolExecutor for concurrency
def main():
    print(f"Downloading {len(template_names)} templates to the 'templates' folder...")
    
    # Track successful and failed downloads
    successful = 0
    failed = []
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        # Use tqdm for a progress bar
        for template_name, success in zip(template_names, list(tqdm(executor.map(download_template, template_names), total=len(template_names)))):
            if success:
                successful += 1
            else:
                failed.append(template_name)
    
    print(f"\nDownload complete! {successful} templates downloaded successfully.")
    
    if failed:
        print(f"{len(failed)} templates failed to download:")
        for template in failed:
            print(f"  - {template}")

if __name__ == "__main__":
    main() 