from PIL import Image

def remove_white_bg(input_path, output_path, tolerance=50):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        if item[0] > 255 - tolerance and item[1] > 255 - tolerance and item[2] > 255 - tolerance:
            new_data.append((255, 255, 255, 0)) # fully transparent
        else:
            new_data.append(item) # original color
            
    img.putdata(new_data)
    
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")

remove_white_bg(r"C:\Users\Admin\Desktop\icon.png", r"c:\Users\Admin\Downloads\capstone-main\artmart\public\mascot.png")
