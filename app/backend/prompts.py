basic_event_prompt_template = 'Format the response in json format with key called "answer" and value is the answer itself.'


event_instruction_template = '''
If your answer contains  a series of events format it as a JSON list where each entry is a json object with the following keys: time(when the event occurred), title(title of the event or incident) and body
).
If the answer for the user doesn't contain any chain of events then just answer them.
'''