import os
import re



with open('kjva_raw.json', 'r') as read:
	with open('kjva.json', 'w') as write:
		result = re.sub('<[^<]+?>', '', read.read())
		write.write(result)
