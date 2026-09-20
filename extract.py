from PIL import Image

def extract_mascot(input_path, output_path, threshold=150):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            new_data.append((0, 0, 0, 255))
        else:
            new_data.append((255, 255, 255, 0))
            
    img.putdata(new_data)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    img.save(output_path, "PNG")

extract_mascot(r"C:\Users\Admin\Desktop\icon.jfif", r"c:\Users\Admin\Downloads\capstone-main\artmart\public\mascot.png")
