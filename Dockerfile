from node

COPY ./ /src

WORKDIR /src

RUN npm i -g git+https://github.com/breadboard-xyz/sandbox-bootloader.git

RUN npm i -g ./

from node

COPY --from=0 /usr/local/bin/ /usr/local/bin/

COPY --from=0 /usr/local/lib/node_modules/ /usr/local/lib/node_modules/

EXPOSE 8080

WORKDIR /usr/local/lib/node_modules/sandbox-bootloader/

CMD breadboard_sandbox_bootloader
