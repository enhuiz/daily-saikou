import numpy as np
import cv2


def crop(path, scale=1):
    image = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if image.shape[-1] == 3:
        b, g, r = cv2.split(image)
        alpha = (image.max(axis=-1) < 255) * 255
        alpha = alpha.astype(np.uint8)
        image = cv2.merge((b, g, r, alpha))

    sx, sy = np.where(image[:, :, -1] > 0)
    sx = (sx.min(), sx.max())
    sy = (sy.min(), sy.max())
    image = image[sx[0]:sx[1], sy[0]:sy[1]]

    image = cv2.resize(image,
                       (
                           int(image.shape[1] * scale),
                           int(image.shape[0] * scale)
                       ))

    cv2.imwrite(path.replace('-full', '').replace('.jpg', '.png'), image)


crop('hit-full.jpg', 0.7)
crop('idle-full.jpg', 0.7)
crop('blood-full.png', 0.8)
crop('crosshair-full.png', 1)
crop('gun-full.png', 0.3)
